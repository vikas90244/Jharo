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
    is_public = models.BooleanField(default=False, db_index=True)
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


class WordMeaning(models.Model):
    word = models.CharField(max_length=120, unique=True)
    definition = models.TextField()
    part_of_speech = models.CharField(max_length=80, blank=True)
    phonetic = models.CharField(max_length=120, blank=True)
    example = models.TextField(blank=True)
    source_name = models.CharField(max_length=100, blank=True)
    source_url = models.URLField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.word


class DailyLearningActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="learning_activity")
    date = models.DateField(db_index=True)
    words_learned = models.PositiveIntegerField(default=0)
    pages_read = models.PositiveIntegerField(default=0)
    learned_words = models.JSONField(default=list)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("user", "date"), name="daily_activity_user_date_uniq"),
        ]
        ordering = ("-date",)


class PageRead(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pages_read")
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="reading_records")
    page_number = models.PositiveIntegerField()
    date = models.DateField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("user", "resource", "page_number", "date"),
                name="readpage_user_day_uniq",
            ),
        ]
        indexes = [models.Index(fields=("user", "date"), name="page_read_user_date_idx")]
        ordering = ("resource__title", "page_number")
