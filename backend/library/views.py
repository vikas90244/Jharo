import re
import uuid
import logging 
from datetime import date, datetime, timedelta
from urllib.error import URLError

from django.db import transaction
from django.conf import settings
from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import FileResponse, Http404
from rest_framework.response import Response
from .meanings import fetch_word_meaning
from .models import DailyLearningActivity, PageRead, Resource, Page, WordMeaning
from .serializers import PageSerializer, ResourceSerializer, ResourceUploadSerializer, InitiateUploadSerializer
from .tasks import split_book
from botocore.exceptions import BotoCoreError , ClientError
from .s3 import (
    create_download_url, 
    create_upload_url, 
    delete_s3_object, 
    get_object_metadata
)

from .throttles import UploadInitiateThrottle

logger= logging.getLogger(__name__)

class StorageUnavailable(APIException):
    status_code=status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail= "Storage is temporarily unavailable"
    default_code= "storage_unavailable"

def get_owned_resource(
    user, resource_id
):
    return get_object_or_404(Resource,  id=resource_id, owner=user)


class InitiateUploadView(APIView):
    permission_classes=[IsAuthenticated]
    throttle_classes= [UploadInitiateThrottle]

    def post(self, request):
        serializer= InitiateUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        filename=serializer.validated_data["filename"]
        size_bytes= serializer.validated_data["size_bytes"]

        resource_id=uuid.uuid4()

        object_key=(
            f"books/{request.user.pk}/{resource_id}/{filename}.pdf"
        )
        resource=Resource.objects.create(
            id=resource_id, 
            owner=request.user, 
            original_filename=filename, 
            object_key= object_key, 
            content_type="application/pdf", 
            size_bytes=size_bytes, 
            status=Resource.Status.PENDING,
        )
        try:
            upload_url= create_upload_url(object_key)
        except (BotoCoreError, ClientError):
            logger.exception(
                "Could not generate upload url for resource %s", 
                resource.id,
            )
            resource.status = Resource.Status.FAILED
            resource.save(update_fields=["status", "updated_at"])
            raise StorageUnavailable
        return Response(
            {
                "resource_id": str(resource.id),
                "upload_url":upload_url, 
                "method":"PUT", 
                "headers":{
                    "Content-Type": "application/pdf"
                },
                "expires_in":settings.S3_PRESIGNED_URL_TTL, 
                "size_bytes":size_bytes, 
                "max_file_size_bytes":settings.MAX_PDF_UPLOAD_SIZE,
            }, 
            status=status.HTTP_201_CREATED
        )



class CompleteUploadView(APIView):
    permission_classes= [IsAuthenticated]

    def post(self, request, resource_id):
        resource= get_owned_resource(request.user, resource_id)

        if resource.status in (
            Resource.Status.PROCESSING,
            Resource.Status.READY,
        ):
            return Response({
                "resource_id": str(resource.id), 
                "status":resource.status
            })
        if resource.status != Resource.Status.PENDING:
            raise ValidationError("This upload is no longer active")

        try:
            metadata=get_object_metadata(resource.object_key)

        except(BotoCoreError, ClientError) as exc:
            error_code= (
                exc.response.get("Error", {}).get("Code", "")
                if isinstance(exc, ClientError)
                else ""
            )

            if error_code in ("404", "NoSuchKey", "NotFound"):
                raise ValidationError(
                    "The file has not been uploaded to S3 yet."
                )

            logger.exception(
                "Could not verify S3 object for resource %s",
                resource.id,
            )
            raise StorageUnavailable()
        actual_size= metadata["size_bytes"]



        if(
            actual_size <=0 
            or actual_size > settings.MAX_PDF_UPLOAD_SIZE
            or actual_size != resource.size_bytes
        ):
            try:
                delete_s3_object(resource.object_key)

            except (BotoCoreError, ClientError):
                logger.exception(
                    "could not delete invalid size object %s", 
                    resource.object_key
                )
            resource.status = Resource.Status.FAILED
            resource.save(update_fields=["status", "updated_at"])

            raise ValidationError(
                "Uploaded file size is invalid or does not match"
            )

        
        if metadata["content_type"] !="application/pdf":
            try:
                delete_s3_object(resource.object_key)
            except (BotoCoreError, ClientError):
                logger.exception(
                    "Could not delete object with invalid content type"
                )
            resource.status = Resource.Status.FAILED
            resource.save(update_fields=["status", "updated_at"])
            raise ValidationError("Invalid uploaded content type")

        
        with transaction.atomic():
            resource = Resource.objects.select_for_update().get(
                id=resource.id,
                owner=request.user,
            )

            if resource.status == Resource.Status.PENDING:
                resource.status = Resource.Status.PROCESSING
                resource.save(update_fields=["status", "updated_at"])

                # from .tasks import process_resource

                # transaction.on_commit(
                #     lambda: process_resource.delay(str(resource.id))
                # )

            elif resource.status not in (
                Resource.Status.PROCESSING,
                Resource.Status.READY,
            ):
                raise ValidationError(
                    "This resource cannot be completed."
                )

        return Response(
            {
                "resource_id": str(resource.id),
                "status": resource.status,
                "message": "Upload verified; PDF processing is queued.",
            },
            status=status.HTTP_200_OK,
        )


class AbortUploadView(APIView):
    permission_classes= [IsAuthenticated]

    def post(self, request, resource_id):
        resource= get_owned_resource(
            request.user, resource_id
        )
        if resource.status != Resource.Status.PENDING:
            raise ValidationError(
                "Only pending uploads can be aborted."
            )

        try:
            # A single PUT doesn't create a multipart upload to abort.
            # If the object exists, remove it.
            metadata = get_object_metadata(resource.object_key)
            if metadata:
                delete_s3_object(resource.object_key)

        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code", "")

            if error_code not in ("404", "NoSuchKey", "NotFound"):
                logger.exception(
                    "Could not abort resource %s",
                    resource.id,
                )
                raise StorageUnavailable()

        except BotoCoreError:
            logger.exception("Could not abort resource %s", resource.id)
            raise StorageUnavailable()

        resource.status = Resource.Status.FAILED
        resource.save(update_fields=["status", "updated_at"])

        return Response({
            "resource_id": str(resource.id),
            "status": resource.status,
        })

class ResourceDownloadURLView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, resource_id):
        resource = get_owned_resource(request.user, resource_id)

        if resource.status != Resource.Status.READY:
            raise ValidationError("This resource is not ready yet.")

        try:
            url = create_download_url(
                resource.object_key,
                expires_in=300,
            )
        except (BotoCoreError, ClientError):
            logger.exception("Could not generate download URL")
            raise StorageUnavailable()

        return Response({
            "url": url,
            "expires_in": 300,
        })


# class ResourceCoverURLView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, resource_id):
#         resource = get_owned_resource(request.user, resource_id)

#         if (
#             resource.status != Resource.Status.READY
#             or not resource.cover_image_key
#         ):
#             raise ValidationError("Cover image is not available yet.")

#         try:
#             url = create_download_url(
#                 resource.cover_image_key,
#                 expires_in=300,
#             )
#         except (BotoCoreError, ClientError):
#             logger.exception("Could not generate cover URL")
#             raise StorageUnavailable()

#         return Response({
#             "url": url,
#             "expires_in": 300,
# })

# class ResourceUploadView(APIView):
#     """Upload a new book (PDF)"""
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]
    
#     def post(self, request):
#         try:

#             serializer = ResourceUploadSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
#         except Exception as e:
#             print(f"exception is {e}")
        
#         if serializer.is_valid():
#             resource = serializer.save()
            
#             # Trigger processing immediately after upload
#             split_book.delay(resource.id)
           
            
#             # # Refresh resource from DB to get updated status and cover
#             # resource.refresh_from_db()
            
#             return Response(
#               data={
#                   "message": "your pdf is being processed"
#               },
#                 status=status.HTTP_201_CREATED
#             )
        
#         return Response(
#             serializer.errors,
#             status=status.HTTP_400_BAD_REQUEST
#         )

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
        ).order_by("original_filename")
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
    permission_classes = [IsAuthenticated]
    
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
            "pages": [{"title": page.resource.original_filename, "page_number": page.page_number} for page in pages],
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
            resource_id = request.data.get("resource_id")
            resource_id = uuid.UUID(str(resource_id))
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



def attach_image_urls(blocks):
    updated_blocks=[]