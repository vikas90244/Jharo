from rest_framework import serializers
from .models import Resource, Page


class ResourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Resource
        fields='__all__'

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model=Page
        fields='__all__'