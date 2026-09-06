from django.urls import path
from .views import ResourceStreamView, PrepareResourceView, ResourceRangeView
urlpatterns = [
    path(
        '<int:pk>/stream/', ResourceStreamView.as_view(), name='document-stream'
    ),
    path(
        'prepare/<int:pk>/', PrepareResourceView.as_view(), name='resource-split'
    ),
    path(
        '<int:pk>/pages/', ResourceRangeView.as_view() , name='resource-range'
    )
]