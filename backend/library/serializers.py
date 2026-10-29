from rest_framework import serializers
from django.conf import settings
from .models import Resource, Page
from .s3 import create_download_url

class ResourceSerializer(serializers.ModelSerializer):
    """Serializer for listing resources"""
    title = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()
    processing_status = serializers.CharField(source="status", read_only=True)
    file_size = serializers.IntegerField(source="size_bytes", read_only=True, allow_null=True)

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

    def get_title(self, resource):
        filename = resource.original_filename
        return filename[:-4] if filename.lower().endswith(".pdf") else filename

    def get_cover_image(self, resource):
        object_key= resource.cover_image_key
        url = create_download_url(object_key, expires_in=900)
        return url


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
        for block in data.get("data", []):
            if block.get("type") ==1:
                object_key=block.get("src")
                if object_key:
                    block["src"] = create_download_url(
                        object_key, 
                        expires_in=900
                    )
                    print(block["src"])

        return data


class InitiateUploadSerializer(serializers.Serializer):

    filename = serializers.CharField(max_length=255)
    size_bytes= serializers.IntegerField(min_value=1)

    def validate_filename(self, value):

        filename = value.replace("\\", "/").rsplit("/", 1)[-1].strip()
        if not filename:
            raise serializers.ValidationError(
                "Filename cannot be empty"
            )
        if not filename.lower().endswith(".pdf"):
            raise serializers.ValidationError(
                "Only PDF files are supported"
            )
        return filename 

    def validate_size_bytes(self, value):
        from django.conf import settings 

        if value > settings.MAX_PDF_UPLOAD_SIZE:
            raise serializers.ValidationError(
                "The maximum PDF size is 1 GiB"
            )
        return value 
