from django.contrib import admin

# Register your models here.
from .models import Resource, Page


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display=["title", "owner", "is_public", "processing_status", "no_of_pages"]
    list_filter=["is_public", "processing_status"]
    list_editable=["is_public"]

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display=["width", "height"]
