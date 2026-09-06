from django.db import models
from django.contrib.auth.models import User 
# Create your models here.

class Resource(models.Model):
    title=       models.CharField(max_length=512)
    owner=       models.ForeignKey(User, on_delete=models.CASCADE, related_name="resources")
    no_of_pages= models.IntegerField()
    object_path= models.FileField(upload_to="pdfs/%y/%m/")
    file_size=   models.PositiveIntegerField(help_text="File size in bytes", null=True)
    file_hash=   models.CharField(max_length=64, blank=True, null=True, help_text="SHA-256 hash to prevent duplicates")

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    )
    processing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    cover_image=        models.ImageField(upload_to="covers/%y/%m/",blank=True, null=True)
    created_at =        models.DateTimeField(auto_now_add=True)
    updated_at =        models.DateTimeField(auto_now=True)    

    def __str__(self):
        return f"{self.title} - {self.no_of_pages}({self.processing_status})"


class Page(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="pages")
    page_number= models.PositiveIntegerField()
    width= models.FloatField()
    height= models.FloatField()
    data= models.JSONField()