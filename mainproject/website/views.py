from django.db import models
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.timesince import timesince
from django.utils import timezone
from django.db.models import Count


import json
import os
from groq import Groq
from dotenv import load_dotenv
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from pdf2image import convert_from_path

# Import models
from .models import University, Branch, Subject, Paper, AnalysisReport

# Load environment variables
load_dotenv()

# Initialize Groq Client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ---------------- TrOCR Load (ONCE) ----------------
# Note: In production, consider moving this to a worker or lazy loading
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")

# ---------------- API HELPER FUNCTIONS ----------------

def trocr_pdf_to_text(pdf_path):
    text = ""
    try:
        images = convert_from_path(pdf_path)
        for img in images:
            pixel_values = processor(images=img, return_tensors="pt").pixel_values
            generated_ids = model.generate(pixel_values)
            generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            text += generated_text.lower() + " "
    except Exception as e:
        print(f"OCR Error: {e}")
    return text

def get_semantic_analysis(all_text):
    prompt = f"""
    Analyze the following messy OCR text from BTech exam papers.
    1. Extract top 10 technical TOPICS.
    2. Extract top 5 REPEATED QUESTIONS.
    OUTPUT FORMAT (Strictly JSON):
    {{ "topics": {{"Topic": 5}}, "questions": {{"Question": 3}} }}
    OCR TEXT: {all_text[:12000]}
    """
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        print(f"Groq API Error: {e}")
        return {"topics": {}, "questions": {}}

# ---------------- MAIN API VIEWS ----------------

def home(request):
    return JsonResponse({'status': 'Backend API is running'})

def select_details(request):
    """Returns dropdown data for the SelectionPage"""
    universities = list(University.objects.values('id', 'name'))
    branches = list(Branch.objects.values('id', 'name'))
    return JsonResponse({
        'universities': universities,
        'branches': branches
    }, safe=False)

def get_subjects(request):
    """Filters subjects based on branch and semester"""
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

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Paper, AnalysisReport
import json

# Agar aap chahte hain ki sirf logged-in user hi use karein, toh ye decorator lagayein
# @login_required 
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Paper, AnalysisReport
import json

# Dashboard logic to fetch analytics
def analysis_dashboard(request):
    # 1. Parameter Extraction
    paper_ids_raw = request.GET.get('paperIds') or request.GET.get('ids')
    if not paper_ids_raw:
        return JsonResponse({'error': 'No papers selected'}, status=400)

    try:
        # Clean IDs and Fetch Papers
        clean_ids = paper_ids_raw.replace('[','').replace(']','')
        paper_ids = [int(pid) for pid in clean_ids.split(',') if pid.strip()]
        papers = Paper.objects.filter(id__in=paper_ids)
        
        if not papers.exists():
            return JsonResponse({'error': 'Papers not found in DB'}, status=404)

        # 2. Optimized OCR Handling (Prevents Double Processing)
        all_text = ""
        from .utils import process_pdf_ocr
        
        for paper in papers:
            # Check: Agar text DB mein pehle se hai aur valid hai (>50 chars)
            if paper.ocr_text and len(paper.ocr_text) > 50:
                print(f"✅ Using existing OCR text for Paper ID: {paper.id}")
                all_text += paper.ocr_text + " "
            else:
                # Agar text nahi hai, tabhi OCR call karein
                print(f"🔍 Processing fresh OCR for Paper ID: {paper.id}")
                try:
                    # Smart path check
                    try:
                        file_path = paper.pdf_file.path
                    except NotImplementedError:
                        file_path = paper.pdf_file.url
                    
                    # Call OCR function with existing_text check
                    text = process_pdf_ocr(file_path, existing_text=paper.ocr_text)
                    
                    if text:
                        paper.ocr_text = text
                        paper.processed = True
                        paper.save() # DB mein save taaki next time loop skip ho jaye
                        all_text += text + " "
                except Exception as ocr_err:
                    print(f"⚠️ OCR skipping for Paper {paper.id}: {ocr_err}")

        # 3. Groq Semantic Analysis
        from .utils import get_semantic_analysis
        # all_text contains the combined content of all selected papers
        analysis_result = get_semantic_analysis(all_text)

        # 4. Report Logging & User Tracking
        try:
            first_paper = papers.first()
            target_user = request.user if request.user.is_authenticated else None
            
            # Create a history record of this analysis
            AnalysisReport.objects.create(
                user=target_user,
                subject=first_paper.subject if first_paper else "Unknown",
                paper=first_paper,
                status='completed'
            )
            print(f"📊 Analysis Report Saved for {'Guest' if not target_user else target_user.username}")
            
        except Exception as save_error:
            print(f"❌ Report Logging Error: {save_error}")

        # 5. Structured Final Response for Frontend
        return JsonResponse({
            'topics': analysis_result.get("topics", {}),
            'questions': analysis_result.get("questions", {}),
            'metadata': {
                'paper_count': papers.count(),
                'analyzed_ids': paper_ids,
                'user': request.user.username if request.user.is_authenticated else "Guest",
                'status': 'Neural Link Synchronized'
            }
        })

    except Exception as e:
        print(f"🚨 Critical View Error: {str(e)}")
        return JsonResponse({'error': f"Server Pipeline Error: {str(e)}"}, status=500)   
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
        data = json.loads(request.body)
        meta_type = data.get('type')
        name = data.get('name')
        if meta_type == 'university':
            obj = University.objects.create(name=name)
        elif meta_type == 'branch':
            obj = Branch.objects.create(name=name)
        elif meta_type == 'subject':
            branch = Branch.objects.get(id=data.get('branch_id'))
            obj = Subject.objects.create(name=name, branch=branch, semester=data.get('semester'))
        return JsonResponse({'id': obj.id, 'status': 'created'})

@csrf_exempt
def admin_login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                if user.is_staff:
                    login(request, user)
                    return JsonResponse({'status': 'success', 'user': username}, status=200)
                return JsonResponse({'error': 'Access denied'}, status=403)
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out successfully'}, status=200)

# ---------------- DASHBOARD & REPORTS API (FIXED) ----------------

def admin_reports_api(request):
    try:
        reports_qs = AnalysisReport.objects.select_related('subject', 'paper__university').order_by('-created_at')
        reports_list = []
        for r in reports_qs:
            reports_list.append({
                "id": r.id,
                "title": f"{r.subject.name} Analysis Report" if r.subject else "Untitled Report",
                "university": r.paper.university.name if r.paper and r.paper.university else "N/A",
                "semester": f"Semester {r.subject.semester}" if r.subject else "N/A",
                "date": r.created_at.strftime("%B %d, %Y"),
                "papers": 1,
                "status": r.status.lower(),
            })

        papers_qs = Paper.objects.select_related('university', 'subject').order_by('-id')[:10]
        uploaded_papers = []
        for p in papers_qs:
            uploaded_papers.append({
                "id": p.id,
                "name": p.pdf_file.name.split('/')[-1],
                "university": p.university.name if p.university else "N/A",
                "uploadDate": "Recently",
                "pages": "N/A",
                "url": p.pdf_file.url if p.pdf_file else "#"
            })

        this_month_count = AnalysisReport.objects.filter(created_at__month=timezone.now().month).count()

        return JsonResponse({
            "reports": reports_list,
            "uploadedPapers": uploaded_papers,
            "stats": {
                "totalReports": len(reports_list),
                "totalPapers": Paper.objects.count(),
                "thisMonth": this_month_count
            }
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            is_google_login = data.get('is_google', False)

            user = None

            if is_google_login:
                # 1. Google Login Logic
                full_name = data.get('full_name', '')
                name_parts = full_name.split(' ', 1)
                first = name_parts[0]
                last = name_parts[1] if len(name_parts) > 1 else ""

                user, created = User.objects.get_or_create(
                    username=email, 
                    defaults={
                        'email': email, 
                        'first_name': first, 
                        'last_name': last
                    }
                )
                # Agar user pehle se tha par name update karna ho toh:
                if not created and full_name:
                    user.first_name = first
                    user.last_name = last
                    user.save()
            else:
                # 2. Normal Login Logic
                from django.contrib.auth import authenticate
                user = authenticate(username=email, password=password)

            if user is not None:
                # Backend specify karna avoid karta hai "Multiple Backends" error
                if not hasattr(user, 'backend'):
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                
                login(request, user)

                # --- FRONTEND COMPATIBILITY KEY: full_name ---
                # strip() use kiya hai taaki agar last_name khali ho toh extra space na aaye
                display_name = f"{user.first_name} {user.last_name}".strip()
                
                return JsonResponse({
                    "status": "success", 
                    "user": {
                        "username": user.username,
                        "email": user.email,
                        "full_name": display_name or user.username # Sabse important fix
                    },
                    "redirect_url": "/selection"
                }, status=200)
            else:
                return JsonResponse({"error": "Invalid credentials"}, status=401)
                
        except Exception as e:
            print(f"Login Error: {str(e)}") # Debugging ke liye
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)
       
@csrf_exempt
def api_signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name', '') # Frontend se name lijiye

        if User.objects.filter(username=email).exists():
            return JsonResponse({"error": "User already exists"}, status=400)

        # Name ko split karke save karein
        name_parts = full_name.split(' ', 1)
        first = name_parts[0]
        last = name_parts[1] if len(name_parts) > 1 else ""

        user = User.objects.create_user(
            username=email, 
            email=email, 
            password=password,
            first_name=first,
            last_name=last
        )
        return JsonResponse({"status": "success", "message": "User created"}, status=201)
    
@csrf_exempt
def api_forgot_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        if User.objects.filter(email=email).exists():
            return JsonResponse({"message": "Password reset link sent"}, status=200)
        return JsonResponse({"error": "Email not found"}, status=404)
    
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

# Firebase Initialization (Sirf ek baar)
if not firebase_admin._apps:
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

@csrf_exempt
def google_auth(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            firebase_token = data.get('token')

            # 1. Firebase Token Verify karein
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            email = decoded_token.get('email')
            name = decoded_token.get('name', '')

            # 2. Django User create ya get karein
            user, created = User.objects.get_or_create(
                username=email, 
                defaults={'email': email, 'first_name': name}
            )

            # 3. Django Session Login (Explicit Backend Specify karein)
            # Kabhi-kabhi default backend session handle nahi karta, isliye manual specify karna better hai
            if not hasattr(user, 'backend'):
                user.backend = 'django.contrib.auth.backends.ModelBackend'
            
            login(request, user)

            # --- Indentation yahan sahi honi chahiye (try block ke andar) ---
            return JsonResponse({
                "status": "success",
                "user": {
                    "email": user.email, 
                    "full_name": user.first_name or user.username
                },
                "redirect_url": "/selection"
            })

        except Exception as e:
            # Terminal pe error dekhne ke liye print zaroor rakhein
            print(f"Auth Error: {str(e)}") 
            return JsonResponse({"error": f"Auth Failed: {str(e)}"}, status=401)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.utils.timesince import timesince
from .models import AnalysisReport, Subject, Paper

@csrf_exempt
def log_admin_activity(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        data = json.loads(request.body or '{}')
        subject_name = data.get('subject_name')
        subject_obj = Subject.objects.filter(name=subject_name).first()

        # Yahan hum user_name ko save kar rahe hain
        AnalysisReport.objects.create(
            user_name=data.get('user_name', 'Guest User'),
            subject=subject_obj,
            semester=data.get('semester', 'N/A'),
            paper_count=data.get('paper_count', 1),
            status='completed' 
        )
        return JsonResponse({"status": "success"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

# Yahi function use karein React Dashboard ke liye
def get_admin_stats(request):
    try:
        total_users = User.objects.count()
        analysis_runs = AnalysisReport.objects.count()
        active_subjects = Subject.objects.count()
        total_papers = Paper.objects.count()

        # Success rate calculation
        success_rate = 100
        if analysis_runs > 0:
            completed = AnalysisReport.objects.filter(status__iexact='completed').count()
            success_rate = int((completed / analysis_runs) * 100)

        # FIX: Yahan user_name ko check karne ka sahi tarika
        recent_activities = AnalysisReport.objects.all().order_by('-created_at')[:10]
        
        activity_list = []
        for act in recent_activities:
            # Priority: 1. user_name field, 2. Logged in user, 3. Default "Guest"
            if act.user_name:
                user_display = act.user_name
            elif act.user:
                user_display = act.user.get_full_name() or act.user.username
            else:
                user_display = "Guest User"

            activity_list.append({
                "user": user_display,
                "initial": user_display[0].upper() if user_display else "G",
                "time": timesince(act.created_at) + " ago",
                "subject": act.subject.name if act.subject else "General Analysis",
                "status": act.status.capitalize() 
            })

        return JsonResponse({
            "stats": {
                "totalUsers": f"{total_users:,}",
                "analysisRuns": f"{analysis_runs:,}",
                "activeSubjects": active_subjects,
                "totalPapers": total_papers,
                "successRate": f"{success_rate}%"
            },
            "recentActivity": activity_list
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)