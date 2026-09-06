from django.shortcuts import render
from rest_framework.views import APIView
# Create your views here.
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import FileResponse, Http404
from rest_framework.response import Response
from .models import Resource, Page
from .splitter import split_resource
from .serializers import PageSerializer
class ResourceStreamView(APIView):
    permission_classes=[AllowAny]
    
    def get(self, request, pk):
        try:
            resource = Resource.objects.get(pk=pk)
            if not resource.object_path:
                raise Http404("resource file not found")

            return FileResponse(
                resource.object_path.open('rb'),
                content_type='application/pdf'
            )
        except Resource.DoesNotExist:
            raise Http404("resource not found ")

class PrepareResourceView(APIView):
    permission_classes=[AllowAny]
    def get(self, request, pk):
        data= split_resource(pk, request)
        return Response(data=data)

class ResourceRangeView(APIView):
    permission_classes=[AllowAny]
    def get(self, request, pk):
        start=request.query_params.get("start")
        end=request.query_params.get("end")
        pages=Page.objects.filter(
            resource__id=pk,
            page_number__gte=start,
            page_number__lte=end
        ).order_by("page_number")
        serializer= PageSerializer(pages, many=True)
        return Response(serializer.data)