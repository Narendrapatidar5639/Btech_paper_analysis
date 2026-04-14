import json
import os
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.timesince import timesince
from django.utils import timezone

# External Libraries
from groq import Groq
from dotenv import load_dotenv
from docling.document_converter import DocumentConverter

# Firebase
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

# Import models
from .models import University, Branch, Subject, Paper, AnalysisReport

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
doc_converter = DocumentConverter()

# Firebase Init
if not firebase_admin._apps:
    try:
        firebase_creds = {
            "type": "service_account",
            "project_id": os.getenv("FIREBASE_PROJECT_ID"),
            "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
            "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
            "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        cred = credentials.Certificate(firebase_creds)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Firebase Init Warning: {e}")

# --- OCR & Analysis Logic ---

def extract_text_with_docling(pdf_source):
    """Cloud URL ya local path dono ko handle karta hai"""
    try:
        result = doc_converter.convert(pdf_source)
        return result.document.export_to_text().strip().lower()
    except Exception as e:
        print(f"Docling OCR Error: {e}")
        return ""

def get_semantic_analysis(all_text):
    if not all_text or len(all_text) < 100:
        return {"topics": {}, "questions": {}}

    prompt = f"""
    Analyze the following BTech exam paper text.
    1. Extract top 10 technical TOPICS and their frequency.
    2. Extract top 5 REPEATED QUESTIONS.
    OUTPUT FORMAT (Strictly JSON):
    {{ "topics": {{"Topic Name": 5}}, "questions": {{"Question Text": 3}} }}
    TEXT: {all_text[:15000]} 
    """
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        return {"topics": {}, "questions": {}}

# --- Main API View ---

# ... (Baki saare login/logout functions as it is rahenge) ...

def analysis_dashboard(request):
    paper_ids_raw = request.GET.get('paperIds') or request.GET.get('ids')
    if not paper_ids_raw:
        return JsonResponse({'error': 'No papers selected'}, status=400)

    try:
        # ID cleaning
        clean_ids = str(paper_ids_raw).replace('[','').replace(']','')
        paper_ids = [int(pid) for pid in clean_ids.split(',') if pid.strip()]
        papers = Paper.objects.filter(id__in=paper_ids)
        
        if not papers.exists():
            return JsonResponse({'error': 'Papers not found in DB'}, status=404)

        all_text = ""
        for paper in papers:
            # Step 1: Check if OCR already exists in DB
            if paper.ocr_text and len(paper.ocr_text) > 100:
                all_text += paper.ocr_text + " "
            else:
                # Step 2: Cloud vs Local Path Handling
                try:
                    # Supabase/Cloud ke liye hamesha .url try karein pehle
                    try:
                        file_url = paper.pdf_file.url
                    except:
                        file_url = paper.pdf_file.path

                    # Step 3: Extract text using Docling
                    text = extract_text_with_docling(file_url)
                    
                    if text:
                        paper.ocr_text = text
                        paper.processed = True
                        paper.save() # DB mein save karein taaki next time fast ho
                        all_text += text + " "
                except Exception as ocr_err:
                    print(f"OCR Failed for Paper {paper.id}: {ocr_err}")

        # Step 4: Final AI Analysis
        analysis_result = get_semantic_analysis(all_text)

        # Step 5: Log Activity
        try:
            first_paper = papers.first()
            AnalysisReport.objects.create(
                user=request.user if request.user.is_authenticated else None,
                subject=first_paper.subject if first_paper else None,
                paper=first_paper,
                status='completed'
            )
        except:
            pass

        return JsonResponse({
            'topics': analysis_result.get("topics", {}),
            'questions': analysis_result.get("questions", {}),
            'metadata': {
                'paper_count': papers.count(),
                'analyzed_ids': paper_ids,
                'status': 'Analysis Complete'
            }
        })
    except Exception as e:
        return JsonResponse({'error': f"Pipeline Error: {str(e)}"}, status=500)
    
# ---------------- MAIN API VIEWS ----------------

def home(request):
    return JsonResponse({'status': 'Backend API is running'})

def select_details(request):
    universities = list(University.objects.values('id', 'name'))
    branches = list(Branch.objects.values('id', 'name'))
    return JsonResponse({
        'universities': universities,
        'branches': branches
    }, safe=False)

def get_subjects(request):
    branch_id = request.GET.get('branch') 
    semester = request.GET.get('semester')
    subjects = Subject.objects.filter(
        branch_id=branch_id, 
        semester=semester
    ).values('id', 'name')
    return JsonResponse(list(subjects), safe=False)

def show_papers(request):
    try:
        uni = request.GET.get('university')
        branch = request.GET.get('branch')
        semester = request.GET.get('semester')
        subject = request.GET.get('subject')

        if not all([uni, branch, semester, subject]):
            return JsonResponse({'error': 'Missing required parameters'}, status=400)

        papers = Paper.objects.filter(
            university_id=uni,
            branch_id=branch,
            semester=semester,
            subject_id=subject
        ).values('id', 'pdf_file') 

        paper_list = list(papers)
        for paper in paper_list:
            paper['pdf_file'] = str(paper['pdf_file'])
            filename = os.path.basename(paper['pdf_file'])
            paper['display_name'] = filename 

        return JsonResponse(paper_list, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ---------------- ADMIN UPLOAD & METADATA ----------------

@csrf_exempt
def admin_upload_papers(request):
    if request.method == 'POST':
        try:
            uni_id = request.POST.get('university')
            branch_id = request.POST.get('branch')
            semester = request.POST.get('semester')
            subject_id = request.POST.get('subject')
            files = request.FILES.getlist('files')

            if not files:
                return JsonResponse({'error': 'No files provided'}, status=400)

            university = get_object_or_404(University, id=uni_id)
            branch = get_object_or_404(Branch, id=branch_id)
            subject = get_object_or_404(Subject, id=subject_id)

            uploaded_count = 0
            for f in files:
                Paper.objects.create(
                    university=university,
                    branch=branch,
                    semester=semester,
                    subject=subject,
                    pdf_file=f
                )
                uploaded_count += 1

            return JsonResponse({
                'message': f'Successfully uploaded {uploaded_count} papers.',
                'status': 'success'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def create_metadata(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            meta_type = data.get('type')
            name = data.get('name')
            obj = None
            if meta_type == 'university':
                obj = University.objects.create(name=name)
            elif meta_type == 'branch':
                obj = Branch.objects.create(name=name)
            elif meta_type == 'subject':
                branch = Branch.objects.get(id=data.get('branch_id'))
                obj = Subject.objects.create(name=name, branch=branch, semester=data.get('semester'))
            
            return JsonResponse({'id': obj.id if obj else None, 'status': 'created'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

# ---------------- AUTHENTICATION VIEWS ----------------

@csrf_exempt
def admin_login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user = authenticate(request, username=data.get('username'), password=data.get('password'))
            if user is not None and user.is_staff:
                login(request, user)
                return JsonResponse({'status': 'success', 'user': user.username}, status=200)
            return JsonResponse({'error': 'Access denied or invalid credentials'}, status=401)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out successfully'}, status=200)

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            is_google = data.get('is_google', False)

            if is_google:
                full_name = data.get('full_name', '')
                parts = full_name.split(' ', 1)
                first = parts[0]
                last = parts[1] if len(parts) > 1 else ""
                user, _ = User.objects.get_or_create(username=email, defaults={'email': email, 'first_name': first, 'last_name': last})
            else:
                user = authenticate(username=email, password=password)

            if user:
                if not hasattr(user, 'backend'):
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                login(request, user)
                display_name = f"{user.first_name} {user.last_name}".strip() or user.username
                return JsonResponse({
                    "status": "success", 
                    "user": {"username": user.username, "email": user.email, "full_name": display_name},
                    "redirect_url": "/selection"
                })
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def api_signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            if User.objects.filter(username=email).exists():
                return JsonResponse({"error": "User already exists"}, status=400)
            
            parts = data.get('full_name', '').split(' ', 1)
            User.objects.create_user(
                username=email, email=email, password=data.get('password'),
                first_name=parts[0], last_name=parts[1] if len(parts) > 1 else ""
            )
            return JsonResponse({"status": "success"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def api_forgot_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        if User.objects.filter(email=data.get('email')).exists():
            return JsonResponse({"message": "Password reset link sent"}, status=200)
        return JsonResponse({"error": "Email not found"}, status=404)

@csrf_exempt
def google_auth(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            decoded_token = firebase_auth.verify_id_token(data.get('token'))
            email = decoded_token.get('email')
            user, _ = User.objects.get_or_create(username=email, defaults={'email': email, 'first_name': decoded_token.get('name', '')})
            
            if not hasattr(user, 'backend'):
                user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            return JsonResponse({"status": "success", "user": {"email": user.email, "full_name": user.first_name or user.username}, "redirect_url": "/selection"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=401)

# ---------------- DASHBOARD & STATS ----------------

def admin_reports_api(request):
    try:
        reports_qs = AnalysisReport.objects.select_related('subject', 'paper__university').order_by('-created_at')
        reports_list = [{
            "id": r.id,
            "title": f"{r.subject.name} Analysis" if r.subject else "Untitled",
            "university": r.paper.university.name if r.paper and r.paper.university else "N/A",
            "semester": f"Sem {r.subject.semester}" if r.subject else "N/A",
            "date": r.created_at.strftime("%B %d, %Y"),
            "status": r.status.lower(),
        } for r in reports_qs]

        papers_qs = Paper.objects.select_related('university', 'subject').order_by('-id')[:10]
        uploaded_papers = [{
            "id": p.id,
            "name": os.path.basename(p.pdf_file.name),
            "university": p.university.name if p.university else "N/A",
            "url": p.pdf_file.url if p.pdf_file else "#"
        } for p in papers_qs]

        return JsonResponse({
            "reports": reports_list,
            "uploadedPapers": uploaded_papers,
            "stats": {
                "totalReports": len(reports_list),
                "totalPapers": Paper.objects.count(),
                "thisMonth": AnalysisReport.objects.filter(created_at__month=timezone.now().month).count()
            }
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def log_admin_activity(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body or '{}')
            subject_obj = Subject.objects.filter(name=data.get('subject_name')).first()
            AnalysisReport.objects.create(
                user_name=data.get('user_name', 'Guest User'),
                subject=subject_obj,
                semester=data.get('semester', 'N/A'),
                status='completed' 
            )
            return JsonResponse({"status": "success"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

def get_admin_stats(request):
    try:
        total_users = User.objects.count()
        analysis_runs = AnalysisReport.objects.count()
        
        recent_activities = AnalysisReport.objects.all().order_by('-created_at')[:10]
        activity_list = []
        for act in recent_activities:
            user_display = act.user_name or (act.user.username if act.user else "Guest User")
            activity_list.append({
                "user": user_display,
                "initial": user_display[0].upper(),
                "time": timesince(act.created_at) + " ago",
                "subject": act.subject.name if act.subject else "General Analysis",
                "status": act.status.capitalize() 
            })

        return JsonResponse({
            "stats": {
                "totalUsers": f"{total_users:,}",
                "analysisRuns": f"{analysis_runs:,}",
                "activeSubjects": Subject.objects.count(),
                "totalPapers": Paper.objects.count(),
                "successRate": "100%"
            },
            "recentActivity": activity_list
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)