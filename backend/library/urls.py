from django.urls import path
from .views import (
    ResourceStreamView, 
    ResourceRangeView,
    ResourceUploadView,
    UserResourcesView,
    PublicResourcesView,
    LearningActivityView,
    LearningActivityDayView,
    RecordLearnedWordView,
    RecordPageReadView,
)

urlpatterns = [
    # Upload & Library
    path('upload/', ResourceUploadView.as_view(), name='resource-upload'),
    path('my-books/', UserResourcesView.as_view(), name='user-resources'),
    path('public-books/', PublicResourcesView.as_view(), name='public-resources'),
    path('activity/', LearningActivityView.as_view(), name='learning-activity'),
    path('activity/words/', RecordLearnedWordView.as_view(), name='record-learned-word'),
    path('activity/pages/', RecordPageReadView.as_view(), name='record-page-read'),
    path('activity/<str:day>/', LearningActivityDayView.as_view(), name='learning-activity-day'),
    
    # Existing endpoints
    path('<int:pk>/stream/', ResourceStreamView.as_view(), name='document-stream'),
    # path('prepare/<int:pk>/', PrepareResourceView.as_view(), name='resource-split'),
    path('<int:pk>/pages/', ResourceRangeView.as_view(), name='resource-range'),
]
