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
try:
    from pdf2image import convert_from_path
except ImportError:
    convert_from_path = None
    print("Warning: pdf2image not installed. PDF conversion will be disabled.")

# Import models
from .models import University, Branch, Subject, Paper, AnalysisReport

# Load environment variables
load_dotenv()

# Initialize Groq Client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ---------------- LOCAL AI MODELS (DISABLED FOR DEPLOYMENT) ----------------
# Ye lines Render (512MB RAM) par crash karti hain, isliye comment ki hain.
# from transformers import TrOCRProcessor, VisionEncoderDecoderModel
# processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
# model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")

# ---------------- API HELPER FUNCTIONS ----------------

def trocr_pdf_to_text(pdf_path):
    text = ""
    # Render par local OCR crash karega, isliye hum sirf empty string bhej rahe hain
    # Analysis ke liye hum DB mein manually added OCR text use karenge.
    return text

def get_semantic_analysis(all_text):
    if not all_text or len(all_text.strip()) < 10:
        return {"topics": {"Data not processed": 0}, "questions": {"No text available": 0}}

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

        # 2. Optimized OCR Handling
        all_text = ""
        for paper in papers:
            if paper.ocr_text and len(paper.ocr_text) > 20:
                all_text += paper.ocr_text + " "
            else:
                all_text += f" [Content for paper {paper.id} pending processing] "

        # 3. Groq Semantic Analysis
        analysis_result = get_semantic_analysis(all_text)

        # 4. Report Logging
        try:
            first_paper = papers.first()
            target_user = request.user if request.user.is_authenticated else None
            AnalysisReport.objects.create(
                user=target_user,
                subject=first_paper.subject if first_paper else None,
                paper=first_paper,
                status='completed'
            )
        except Exception as save_error:
            print(f"❌ Report Logging Error: {save_error}")

        # 5. Final Response
        return JsonResponse({
            'topics': analysis_result.get("topics", {}),
            'questions': analysis_result.get("questions", {}),
            'metadata': {
                'paper_count': papers.count(),
                'analyzed_ids': paper_ids,
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

            for f in files:
                Paper.objects.create(
                    university=university, branch=branch, 
                    semester=semester, subject=subject, pdf_file=f
                )

            return JsonResponse({'message': 'Success', 'status': 'success'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=405)

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
        data = json.loads(request.body)
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if user is not None and user.is_staff:
            login(request, user)
            return JsonResponse({'status': 'success', 'user': user.username})
        return JsonResponse({'error': 'Denied'}, status=403)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def admin_logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out'}, status=200)

def admin_reports_api(request):
    try:
        reports_qs = AnalysisReport.objects.select_related('subject', 'paper__university').order_by('-created_at')
        reports_list = []
        for r in reports_qs:
            reports_list.append({
                "id": r.id,
                "title": f"{r.subject.name if r.subject else 'Analysis'} Report",
                "university": r.paper.university.name if r.paper and r.paper.university else "N/A",
                "date": r.created_at.strftime("%B %d, %Y"),
                "status": r.status.lower(),
            })
        return JsonResponse({"reports": reports_list})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email, password = data.get('email'), data.get('password')
            is_google = data.get('is_google', False)
            user = None
            if is_google:
                full_name = data.get('full_name', '')
                user, _ = User.objects.get_or_create(username=email, defaults={'email': email, 'first_name': full_name})
            else:
                user = authenticate(username=email, password=password)

            if user:
                if not hasattr(user, 'backend'):
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                login(request, user)
                return JsonResponse({"status": "success", "user": {"email": user.email, "full_name": f"{user.first_name} {user.last_name}".strip() or user.username}})
            return JsonResponse({"error": "Invalid"}, status=401)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def api_signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        if User.objects.filter(username=data.get('email')).exists():
            return JsonResponse({"error": "Exists"}, status=400)
        User.objects.create_user(username=data.get('email'), email=data.get('email'), password=data.get('password'), first_name=data.get('full_name', ''))
        return JsonResponse({"status": "success"}, status=201)

@csrf_exempt
def google_auth(request):
    # Same as your original google auth logic
    return JsonResponse({"status": "under development"})

def get_admin_stats(request):
    try:
        total_users = User.objects.count()
        analysis_runs = AnalysisReport.objects.count()
        activity_list = []
        recent_activities = AnalysisReport.objects.all().order_by('-created_at')[:10]
        for act in recent_activities:
            user_display = act.user_name if hasattr(act, 'user_name') and act.user_name else "Guest"
            activity_list.append({
                "user": user_display,
                "time": timesince(act.created_at) + " ago",
                "subject": act.subject.name if act.subject else "General",
                "status": act.status.capitalize() 
            })
        return JsonResponse({
            "stats": {"totalUsers": total_users, "analysisRuns": analysis_runs, "totalPapers": Paper.objects.count()},
            "recentActivity": activity_list
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def log_admin_activity(request):
    if request.method == 'POST':
        data = json.loads(request.body or '{}')
        AnalysisReport.objects.create(user_name=data.get('user_name', 'Guest'), status='completed')
        return JsonResponse({"status": "success"})