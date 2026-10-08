from celery import shared_task
from .splitter import split_resource_into_pages
@shared_task
def split_book(id):
    try:
     split_resource_into_pages(id)
    except Exception as e:
       print(e)
    print("we are done processing ")