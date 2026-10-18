import logging

from celery import shared_task
from .models import Resource
from .splitter import split_resource_into_pages

logger = logging.getLogger(__name__)


@shared_task
def split_book(resource_id):
    try:
        Resource.objects.filter(id=resource_id).update(processing_status="processing")
        split_resource_into_pages(resource_id)
    except Exception:
        Resource.objects.filter(id=resource_id).update(processing_status="failed")
        logger.exception("Failed to process PDF resource %s", resource_id)
        raise
