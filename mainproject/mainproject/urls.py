from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from website import views

urlpatterns = [
    path('admin/', admin.site.urls),
    # Prefixing with 'api/' prevents Django from fighting React for the '/' route
    path('api/', include('website.urls')), 
    path('', views.home, name='home'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)