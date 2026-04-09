from django.contrib import admin
from .models import University, Branch, Subject, Paper

admin.site.register(University)
admin.site.register(Branch)
admin.site.register(Subject)

@admin.register(Paper)
class PaperAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'semester', 'processed')
