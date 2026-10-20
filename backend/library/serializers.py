from rest_framework import serializers
from django.conf import settings
from .models import Resource, Page


class ResourceSerializer(serializers.ModelSerializer):
    """Serializer for listing resources"""
    class Meta:
        model = Resource
        fields = [
            'id', 
            'title', 
            'no_of_pages', 
            'cover_image',
            'processing_status',
            'is_public',
            'file_size',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ResourceUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading new resources"""
    class Meta:
        model = Resource
        fields = ['title', 'object_path']
    
    def create(self, validated_data):
        # Add owner from request context
        validated_data['owner'] = self.context['request'].user
        validated_data['no_of_pages'] = 0  # Will be updated after processing
        validated_data['processing_status'] = 'pending'
        return super().create(validated_data)


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if request and request.is_secure():
            host = request.get_host()
            insecure_media_prefix = f"http://{host}{settings.MEDIA_URL}"
            secure_media_prefix = f"https://{host}{settings.MEDIA_URL}"
            for block in data.get("data", []):
                src = block.get("src")
                if isinstance(src, str) and src.startswith(insecure_media_prefix):
                    block["src"] = secure_media_prefix + src[len(insecure_media_prefix):]
        return data
