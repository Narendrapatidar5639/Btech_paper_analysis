from django.db import models
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.timesince import timesince
from django.utils import timezone
from django.db.models import Count
from django.contrib.auth.decorators import login_required

import json
import os
from groq import Groq
from dotenv import load_dotenv

# Import models
from .models import University, Branch, Subject, Paper, AnalysisReport

# Load environment variables
load_dotenv()

# Initialize Groq Client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ---------------- Heavy Libraries Safety Load ----------------
try:
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel
    from pdf2image import convert_from_path
    # Load models only if libraries are present
    processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
    model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")
except Exception as e:
    processor = None
    model = None
    convert_from_path = None
    print(f"⚠️ Heavy libraries (TrOCR/pdf2image) not loaded: {e}")

# ---------------- API HELPER FUNCTIONS ----------------

def trocr_pdf_to_text(pdf_path):
    text = ""
    if not convert_from_path or not processor:
        return "OCR Service temporarily unavailable on this node."
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

def analysis_dashboard(request):
    paper_ids_raw = request.GET.get('paperIds') or request.GET.get('ids')
    if not paper_ids_raw:
        return JsonResponse({'error': 'No papers selected'}, status=400)

    try:
        clean_ids = paper_ids_raw.replace('[','').replace(']','')
        paper_ids = [int(pid) for pid in clean_ids.split(',') if pid.strip()]
        papers = Paper.objects.filter(id__in=paper_ids)
        
        if not papers.exists():
            return JsonResponse({'error': 'Papers not found in DB'}, status=404)

        all_text = ""
        # Local import to prevent circular dependency
        from .utils import get_semantic_analysis as fetch_analysis
        
        for paper in papers:
            if paper.ocr_text and len(paper.ocr_text) > 50:
                all_text += paper.ocr_text + " "
            else:
                # OCR processing can be slow, normally this would be a celery task
                print(f"🔍 OCR needed for Paper ID: {paper.id}")
                # For now, we use existing text if available
                if paper.ocr_text:
                    all_text += paper.ocr_text + " "

        analysis_result = fetch_analysis(all_text)

        # Logging report
        try:
            first_paper = papers.first()
            target_user = request.user if request.user.is_authenticated else None
            AnalysisReport.objects.create(
                user=target_user,
                subject=first_paper.subject if first_paper else None,
                paper=first_paper,
                status='completed'
            )
        except: pass

        return JsonResponse({
            'topics': analysis_result.get("topics", {}),
            'questions': analysis_result.get("questions", {}),
            'metadata': {
                'paper_count': papers.count(),
                'status': 'Neural Link Synchronized'
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def admin_upload_papers(request):
    if request.method == 'POST':
        try:
            uni_id = request.POST.get('university')
            branch_id = request.POST.get('branch')
            semester = request.POST.get('semester')
            subject_id = request.POST.get('subject')
            files = request.FILES.getlist('files')

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

            return JsonResponse({'message': f'Uploaded {uploaded_count} papers.', 'status': 'success'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def create_metadata(request):
    if request.method == 'POST':
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
        return JsonResponse({'id': obj.id, 'status': 'created'})

@csrf_exempt
def admin_login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if user and user.is_staff:
            login(request, user)
            return JsonResponse({'status': 'success', 'user': user.username})
        return JsonResponse({'error': 'Unauthorized'}, status=401)

@csrf_exempt
def admin_logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out successfully'})

def admin_reports_api(request):
    try:
        reports_qs = AnalysisReport.objects.all().order_by('-created_at')
        reports_list = [{
            "id": r.id,
            "title": f"{r.subject.name if r.subject else 'General'} Report",
            "date": r.created_at.strftime("%B %d, %Y"),
            "status": r.status.lower()
        } for r in reports_qs[:20]]

        return JsonResponse({
            "reports": reports_list,
            "stats": {
                "totalReports": AnalysisReport.objects.count(),
                "totalPapers": Paper.objects.count(),
            }
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            is_google_login = data.get('is_google', False)

            if is_google_login:
                user, created = User.objects.get_or_create(username=email, defaults={'email': email})
                if not created and data.get('full_name'):
                    name_parts = data.get('full_name').split(' ', 1)
                    user.first_name = name_parts[0]
                    user.last_name = name_parts[1] if len(name_parts) > 1 else ""
                    user.save()
            else:
                user = authenticate(username=email, password=password)

            if user:
                if not hasattr(user, 'backend'):
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                login(request, user)
                return JsonResponse({
                    "status": "success",
                    "user": {"username": user.username, "full_name": f"{user.first_name} {user.last_name}".strip() or user.username}
                })
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import login

@csrf_exempt
def api_signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            full_name = data.get('full_name', '')

            if not email or not password:
                return JsonResponse({"error": "Email and password are required"}, status=400)

            if User.objects.filter(username=email).exists():
                return JsonResponse({"error": "User already exists"}, status=400)
            
            name_parts = full_name.split(' ', 1)
            user = User.objects.create_user(
                username=email, 
                email=email, 
                password=password,
                first_name=name_parts[0], 
                last_name=name_parts[1] if len(name_parts) > 1 else ""
            )
            return JsonResponse({"status": "success", "message": "User created"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    # Correction: Handle non-POST requests
    return JsonResponse({"error": "Method Not Allowed"}, status=405)

@csrf_exempt
def api_forgot_password(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            if User.objects.filter(email=email).exists():
                return JsonResponse({"message": "Password reset link sent"}, status=200)
            return JsonResponse({"error": "Email not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    # Correction: Handle non-POST requests
    return JsonResponse({"error": "Method Not Allowed"}, status=405)

@csrf_exempt
def google_auth(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({"error": "Email is required"}, status=400)

            # user, created ka use karein taaki code clean rahe
            user, created = User.objects.get_or_create(
                username=email, 
                defaults={'email': email, 'first_name': data.get('full_name', '')}
            )
            
            if not hasattr(user, 'backend'):
                user.backend = 'django.contrib.auth.backends.ModelBackend'
            
            login(request, user)
            return JsonResponse({
                "status": "success", 
                "user": {"full_name": user.first_name or user.username}
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=401)
            
    # Correction: Handle non-POST requests
    return JsonResponse({"error": "Method Not Allowed"}, status=405)

@csrf_exempt
def log_admin_activity(request):
    if request.method == 'POST':
        data = json.loads(request.body or '{}')
        AnalysisReport.objects.create(
            user_name=data.get('user_name', 'Guest User'),
            status='completed'
        )
        return JsonResponse({"status": "success"}, status=201)

def get_admin_stats(request):
    try:
        total_users = User.objects.count()
        analysis_runs = AnalysisReport.objects.count()
        activity_list = []
        recent_activities = AnalysisReport.objects.all().order_by('-created_at')[:10]
        
        for act in recent_activities:
            user_display = act.user_name or (act.user.username if act.user else "Guest User")
            activity_list.append({
                "user": user_display,
                "time": timesince(act.created_at) + " ago",
                "status": act.status.capitalize()
            })

        return JsonResponse({
            "stats": {
                "totalUsers": total_users,
                "analysisRuns": analysis_runs,
                "totalPapers": Paper.objects.count(),
            },
            "recentActivity": activity_list
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)