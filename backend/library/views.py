from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import FileResponse, Http404
from rest_framework.response import Response
from .models import Resource, Page
from .serializers import PageSerializer, ResourceSerializer, ResourceUploadSerializer
from .tasks import split_book


class ResourceUploadView(APIView):
    """Upload a new book (PDF)"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        try:

            serializer = ResourceUploadSerializer(
                data=request.data,
                context={'request': request}
            )
        except Exception as e:
            print(f"exception is {e}")
        
        if serializer.is_valid():
            resource = serializer.save()
            
            # Trigger processing immediately after upload
            split_book.delay(resource.id)
           
            
            # # Refresh resource from DB to get updated status and cover
            # resource.refresh_from_db()
            
            return Response(
              data={
                  "message": "your pdf is being processed"
              },
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class UserResourcesView(APIView):
    """Get all books for the logged-in user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        resources = Resource.objects.filter(
            owner=request.user
        ).order_by('-created_at')
        
        serializer = ResourceSerializer(
            resources,
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)




class ResourceStreamView(APIView):
    permission_classes = [AllowAny]
    
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
            raise Http404("resource not found")


# class PrepareResourceView(APIView):
#     permission_classes = [AllowAny]
    
#     def get(self, request, pk):
#         data = split_resource(pk, request)
#         return Response(data=data)


class ResourceRangeView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        pages = Page.objects.filter(
            resource__id=pk,
            page_number__gte=start,
            page_number__lte=end
        ).order_by("page_number")
        serializer = PageSerializer(pages, many=True)
        return Response(serializer.data)
