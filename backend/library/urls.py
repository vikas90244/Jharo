from django.urls import path
from .views import (
    ResourceStreamView, 
    PrepareResourceView, 
    ResourceRangeView,
    ResourceUploadView,
    UserResourcesView
)

urlpatterns = [
    # Upload & Library
    path('upload/', ResourceUploadView.as_view(), name='resource-upload'),
    path('my-books/', UserResourcesView.as_view(), name='user-resources'),
    
    # Existing endpoints
    path('<int:pk>/stream/', ResourceStreamView.as_view(), name='document-stream'),
    path('prepare/<int:pk>/', PrepareResourceView.as_view(), name='resource-split'),
    path('<int:pk>/pages/', ResourceRangeView.as_view(), name='resource-range'),
]
