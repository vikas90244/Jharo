from rest_framework import serializers
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
