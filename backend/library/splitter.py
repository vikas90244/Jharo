import pymupdf
from .models import Resource, Page
from pathlib import Path 
from django.conf import settings
from django.core.files.base import ContentFile
from django.db import transaction
from .s3 import get_s3_client, create_download_url
# import json
import logging 
import requests
logging=logging.getLogger(__name__)

class ResourceSpliterService:

    BASE_URL= settings.BASE_URL
    def __init__(self, resource, image_dir, doc ):
        self.resource = resource
        self.image_dir= image_dir
        self.image_dir.mkdir(parents=True, exist_ok=True)
        self.doc=doc


    def upload_image(self, image_bytes, object_key):
         return get_s3_client().put_object(
              Bucket=settings.AWS_STORAGE_BUCKET_NAME, 
              Key=object_key, 
              Body=image_bytes, 
              ContentType="image/png", 
         )
    
    def generate_cover_image(self):
           if len(self.doc) > 0:
                first_page = self.doc[0]
                
                # Render first page as image at good quality
                zoom = 2
                mat = pymupdf.Matrix(zoom, zoom)
                pix = first_page.get_pixmap(matrix=mat)
                
                # Convert to PNG bytes
                cover_image_bytes = pix.tobytes("png")
                
                # Save as cover image
                cover_image_obj_key = f"books/{self.resource.owner.id}/{self.resource.id}/cover_page_0.png"
                self.upload_image(cover_image_bytes, cover_image_obj_key)
                self.resource.cover_image_key= cover_image_obj_key
                self.resource.save()


    def split_into_pages(self ):
         for i,page in enumerate(self.doc):
                print(f'page:{i}------{page}')
                content=page.get_text("dict")
                blocks=content["blocks"]
                for j, block in enumerate(blocks):
                    if block["type"]==1:
                        image_bytes=block["image"]
                        image_ext= block["ext"]
        
                        image_object_key=f"books/{self.resource.owner.id}/{self.resource.id}_image_page_{i}_block_{j}.{image_ext}"

                        self.upload_image(image_bytes, image_object_key)
        
                        block["src"] = image_object_key
                        del block["image"]
                        del block["ext"]
                    block.pop("mask", None)
                Page.objects.create(
                    resource=self.resource,
                    page_number=i,
                    width=content["width"],
                    height= content["height"],
                    data=blocks
                )


def downlaod_pdf(object_key, file_path):
    url = create_download_url(object_key)
    with requests.get(url, stream=True, timeout=60) as response:
        response.raise_for_status()

        with open(file_path, "wb") as file:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    file.write(chunk)



# split manager 
def split_resource_into_pages(id):

    with transaction.atomic():
        # prepare sources for processing 
        resource = Resource.objects.select_for_update().get(id=id)
        object_key=resource.object_key

        media_dir = Path(settings.MEDIA_ROOT)
        file_path = media_dir / object_key
        file_path.parent.mkdir(parents=True, exist_ok=True)
        downlaod_pdf(object_key, file_path)

        # mark for deletion
        image_dir = Path(settings.MEDIA_ROOT) / "resources" / str(resource.id)
        doc = pymupdf.open(file_path)

        try:
            Page.objects.filter(resource=resource).delete()
            splitter = ResourceSpliterService(
                resource=resource,
                image_dir=image_dir,
                doc=doc,
            )

            splitter.generate_cover_image()
            splitter.split_into_pages()
            resource.no_of_pages = len(doc)
            resource.processing_status = "ready"
            resource.save()
        finally:
            doc.close()
            file_path=Path(file_path)

            if file_path.is_file():
                file_path.unlink()
                print("------deleting local file-----")
            else:
                print("file not found")


