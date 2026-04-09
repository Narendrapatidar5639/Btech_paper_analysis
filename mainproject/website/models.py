from django.db import models
from django.contrib.auth.models import User
import os

# 1. University Model
class University(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Universities"

    def __str__(self):
        return self.name

# 2. Branch Model
class Branch(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

# 3. Subject Model
class Subject(models.Model):
    name = models.CharField(max_length=200)
    semester = models.IntegerField()
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='subjects')

    def __str__(self):
        return f"{self.name} (Sem {self.semester} - {self.branch.name})"

# 4. Paper Model (Storing PDFs and OCR results)
class Paper(models.Model):
    display_name = models.CharField(max_length=255, default="Question Paper")
    pdf_file = models.FileField(upload_to='papers/')
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    semester = models.IntegerField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    ocr_text = models.TextField(blank=True, null=True)
    processed = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"{self.subject.name} - {self.university.name} (Sem {self.semester})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.pdf_file and not self.ocr_text:
            try:
                from .utils import process_pdf_ocr
                print(f"🔄 Starting OCR for: {self.pdf_file.name}")
                
                try:
                    file_to_process = self.pdf_file.path
                except NotImplementedError:
                    file_to_process = self.pdf_file.url
                
                text = process_pdf_ocr(file_to_process)
                
                Paper.objects.filter(id=self.id).update(
                    ocr_text=text, 
                    processed=True
                )
                print(f"✅ OCR Success for ID: {self.id}")
            except Exception as e:
                print(f"❌ OCR Error in Model Save: {e}")

# 5. AnalysisReport Model (Optimized for Admin Dashboard)
class AnalysisReport(models.Model):
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('processing', 'Processing'),
        ('failed', 'Failed'),
    ]

    # ForeignKey for Logged-in users
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='reports'
    ) 
    
    # Extra field to store Name from Frontend (Fix for "Guest" issue)
    user_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Details about the selection
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    semester = models.CharField(max_length=10, blank=True, null=True)
    paper_count = models.IntegerField(default=1)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        name = self.user_name if self.user_name else (self.user.username if self.user else "Unknown Entity")
        return f"{name} - {self.subject.name} ({self.status})"

    class Meta:
        ordering = ['-created_at']