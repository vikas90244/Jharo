from django.contrib import admin

# Register your models here.
from .models import Resource, Page


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display=["title", "no_of_pages"]
    list_filter=["no_of_pages", "file_size"]

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display=["width", "height"]