import uuid

from django.conf import settings
from django.db import models
# Create your models here.
from django.utils import timezone
from datetime import timedelta
from django.conf import settings 
def upload_expiry():
    return timezone.now() + timedelta(
        hours=settings.UPLOAD_EXPIRY_HOURS
    )


class Resource(models.Model):
    id = models.UUIDField( primary_key=True, default=uuid.uuid4, editable=False, )

    owner = models.ForeignKey( settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="resources", )

    original_filename = models.CharField(max_length=255)
    object_key = models.CharField(max_length=1024, unique=True)

    cover_image_key = models.CharField( max_length=1024, blank=True, default="", )

    no_of_pages = models.IntegerField(default=0)
    content_type = models.CharField(
        max_length=100,
        default="application/pdf",
    )
    size_bytes = models.PositiveBigIntegerField(null=True)

    file_hash = models.CharField( max_length=64, blank=True, null=True, help_text="SHA-256 hash to prevent duplicates",
    )

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    is_public = models.BooleanField(default=False, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.original_filename

class Page(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="pages")
    page_number= models.PositiveIntegerField()
    width= models.FloatField()
    height= models.FloatField()
    data= models.JSONField()


class WordMeaning(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="learning_activity")
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
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="pages_read")
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
        ordering = ("resource__original_filename", "page_number")
