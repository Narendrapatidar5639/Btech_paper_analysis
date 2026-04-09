from django.urls import path
from . import views
from .views import api_login, api_signup, api_forgot_password

# In sab ke peeche 'api/' automatically lag jayega main urls.py ki wajah se
urlpatterns = [
    path('selection-metadata/', views.select_details, name='select_metadata'),
    path('papers/', views.show_papers, name='papers'),
    path('dashboard/', views.analysis_dashboard, name='dashboard'),
    path('get-subjects/', views.get_subjects, name='get_subjects'),
    
    # FIX: Yahan se 'api/' hata diya kyunki wo main urls.py se aa raha hai
    path('admin/upload/', views.admin_upload_papers, name='admin_upload_papers'),
    path('admin/create-metadata/', views.create_metadata, name='create_metadata'),
    path('admin/login/', views.admin_login_view, name='admin_login'),
    path('admin/logout/', views.admin_logout_view, name='admin_logout'),
    #path('admin/dashboard-stats/', views.admin_dashboard_stats, name='dashboard_stats'),
    path('admin/reports/', views.admin_reports_api, name='admin_reports_api'),
    
    path('auth/login/', api_login, name='api_login'),
    path('auth/signup/', api_signup, name='api_signup'),
    path('auth/forgot-password/', api_forgot_password, name='api_forgot_password'),
    path('auth/google/', views.google_auth, name='google_auth'),
    
    path('admin/activity-log/', views.log_admin_activity, name='log_activity'),
    path('admin/dashboard-stats/', views.get_admin_stats, name='admin_stats'),
]