import re
from datetime import date, datetime, timedelta
from urllib.error import URLError

from django.db import transaction
from django.db.models import F, Q
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import FileResponse, Http404
from rest_framework.response import Response
from .meanings import fetch_word_meaning
from .models import DailyLearningActivity, PageRead, Resource, Page, WordMeaning
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
            Q(owner=request.user) | Q(is_public=True)
        ).distinct().order_by('-created_at')
        
        serializer = ResourceSerializer(
            resources,
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)




class PublicResourcesView(APIView):
    """List ready-to-read books available to everyone."""
    permission_classes = [AllowAny]

    def get(self, request):
        resources = Resource.objects.filter(
            is_public=True,
            processing_status="ready",
        ).order_by("title")
        serializer = ResourceSerializer(resources, many=True, context={"request": request})
        return Response(serializer.data)


def accessible_resources(request):
    resources = Resource.objects.all()
    if request.user.is_authenticated:
        return resources.filter(Q(is_public=True) | Q(owner=request.user))
    return resources.filter(is_public=True)


class ResourceStreamView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        try:
            resource = accessible_resources(request).get(pk=pk)
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
        get_object_or_404(accessible_resources(request), pk=pk)
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        pages = Page.objects.filter(
            resource__id=pk,
            page_number__gte=start,
            page_number__lte=end
        ).order_by("page_number")
        serializer = PageSerializer(pages, many=True, context={"request": request})
        return Response(serializer.data)


def parse_activity_date(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


class LearningActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        requested_today = parse_activity_date(request.query_params.get("today"))
        today = requested_today or timezone.localdate()
        try:
            year = int(request.query_params.get("year", today.year))
            start = date(year, 1, 1)
            end = date(year + 1, 1, 1)
        except (TypeError, ValueError):
            return Response({"error": "A valid year is required."}, status=status.HTTP_400_BAD_REQUEST)

        activity_rows = DailyLearningActivity.objects.filter(
            user=request.user,
            date__gte=start,
            date__lt=end,
        ).values("date", "words_learned", "pages_read")
        active_page_dates = set(
            PageRead.objects.filter(user=request.user, date__lte=today)
            .values_list("date", flat=True)
            .distinct()
        )

        streak = 0
        streak_day = today
        if streak_day not in active_page_dates:
            streak_day -= timedelta(days=1)
        while streak_day in active_page_dates:
            streak += 1
            streak_day -= timedelta(days=1)

        return Response({
            "year": year,
            "streak": streak,
            "days": [
                {
                    "date": row["date"].isoformat(),
                    "words_learned": row["words_learned"],
                    "pages_read": row["pages_read"],
                }
                for row in activity_rows
            ],
        })


class LearningActivityDayView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, day):
        activity_date = parse_activity_date(day)
        if activity_date is None:
            return Response({"error": "Date must use YYYY-MM-DD format."}, status=status.HTTP_400_BAD_REQUEST)

        activity = DailyLearningActivity.objects.filter(user=request.user, date=activity_date).first()
        pages = PageRead.objects.filter(user=request.user, date=activity_date).select_related("resource")
        return Response({
            "date": day,
            "words": activity.learned_words if activity else [],
            "words_learned": activity.words_learned if activity else 0,
            "pages_read": activity.pages_read if activity else 0,
            "pages": [{"title": page.resource.title, "page_number": page.page_number} for page in pages],
        })


class RecordLearnedWordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        word = request.data.get("word", "")
        activity_date = timezone.localdate()
        normalized_word = re.sub(r"^\W+|\W+$", "", str(word).strip().casefold())
        if not normalized_word or len(normalized_word) > 120:
            return Response({"error": "A valid word is required."}, status=status.HTTP_400_BAD_REQUEST)

        meaning = WordMeaning.objects.filter(word=normalized_word).first()
        if meaning is None:
            try:
                meaning_data = fetch_word_meaning(normalized_word)
            except (URLError, TimeoutError, ValueError):
                return Response({"error": "The dictionary service is unavailable. Try again."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            if meaning_data is None:
                return Response({"error": "No meaning found for this word."}, status=status.HTTP_404_NOT_FOUND)
            meaning, _ = WordMeaning.objects.get_or_create(word=normalized_word, defaults=meaning_data)

        with transaction.atomic():
            activity, _ = DailyLearningActivity.objects.get_or_create(
                user=request.user,
                date=activity_date,
            )
            activity = DailyLearningActivity.objects.select_for_update().get(pk=activity.pk)
            is_new_word = normalized_word not in activity.learned_words
            if is_new_word:
                activity.learned_words.append(normalized_word)
                activity.words_learned += 1
                activity.save(update_fields=("learned_words", "words_learned"))

        response = {
            "word": meaning.word,
            "definition": meaning.definition,
            "part_of_speech": meaning.part_of_speech,
            "phonetic": meaning.phonetic,
            "example": meaning.example,
            "source_name": meaning.source_name,
            "source_url": meaning.source_url,
            "newly_learned": is_new_word,
            "words_learned": activity.words_learned,
        }
        response_status = status.HTTP_201_CREATED if is_new_word else status.HTTP_200_OK
        return Response(response, status=response_status)


class RecordPageReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        activity_date = timezone.localdate()
        try:
            resource_id = int(request.data.get("resource_id"))
            page_number = int(request.data.get("page_number"))
        except (TypeError, ValueError):
            return Response({"error": "A valid resource and page number are required."}, status=status.HTTP_400_BAD_REQUEST)

        if page_number < 1:
            return Response({"error": "A valid page number is required."}, status=status.HTTP_400_BAD_REQUEST)

        resource = get_object_or_404(
            Resource.objects.filter(Q(owner=request.user) | Q(is_public=True)),
            id=resource_id,
        )
        with transaction.atomic():
            _, created = PageRead.objects.get_or_create(
                user=request.user,
                resource=resource,
                page_number=page_number,
                date=activity_date,
            )
            if created:
                activity, _ = DailyLearningActivity.objects.get_or_create(user=request.user, date=activity_date)
                DailyLearningActivity.objects.filter(pk=activity.pk).update(pages_read=F("pages_read") + 1)
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response({"message": "Page read recorded."}, status=response_status)
