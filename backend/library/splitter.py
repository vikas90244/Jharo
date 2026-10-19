import pymupdf
from .models import Resource, Page
from pathlib import Path 
from django.conf import settings
from django.core.files.base import ContentFile
from django.db import transaction
# import json

class ResourceSpliterService:

    BASE_URL= settings.BASE_URL
    def __init__(self, resource, image_dir, doc ):
        self.resource = resource
        self.image_dir= image_dir
        self.image_dir.mkdir(parents=True, exist_ok=True)
        self.doc=doc

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
                cover_filename = f"cover_page_0.png"
                self.resource.cover_image.save(
                    cover_filename,
                    ContentFile(cover_image_bytes),
                    save=False  # Don't save yet, we'll save at the end
                )


    def split_into_pages(self ):
         for i,page in enumerate(self.doc):
                print(f'page:{i}------{page}')
                content=page.get_text("dict")
                blocks=content["blocks"]
                for j, block in enumerate(blocks):
                    if block["type"]==1:
                        image_bytes=block["image"]
                        image_ext= block["ext"]
        
                        filename=f"image_page_{i}_block_{j}.{image_ext}"
                        file_path= self.image_dir/filename
        
                        with open(file_path, "wb") as f: 
                            f.write(image_bytes)
                        relative_url = f"{settings.MEDIA_URL}resources/{self.resource.id}/{filename}"
        
                        block["src"] =  f"{self.BASE_URL}{relative_url}"
                        del block["image"]
                        del block["ext"]
                    # PyMuPDF may include a binary image mask. The page API
                    # only needs the extracted image URL, and bytes cannot be
                    # stored in the page JSONField.
                    block.pop("mask", None)
                Page.objects.create(
                    resource=self.resource,
                    page_number=i,
                    width=content["width"],
                    height= content["height"],
                    data=blocks
                )


def split_resource_into_pages(id ):
    with transaction.atomic():
        resource = Resource.objects.select_for_update().get(id=id)
        image_dir = Path(settings.MEDIA_ROOT) / "resources" / str(resource.id)
        doc = pymupdf.open(resource.object_path.path)

        try:
            # Make retries replace earlier page data instead of duplicating it.
            # If processing fails, the transaction restores the previous rows.
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





        
# def split_resource(id, request):
#     resource=Resource.objects.get(id=id)
#     image_dir=Path(settings.MEDIA_ROOT)/"resources"/str(resource.id)

#     image_dir.mkdir(parents=True, exist_ok=True)

#     doc=pymupdf.open(resource.object_path.path)
    
    
#     # Generate cover image from first page
#     if len(doc) > 0:
#         first_page = doc[0]
        
#         # Render first page as image at good quality
#         zoom = 2
#         mat = pymupdf.Matrix(zoom, zoom)
#         pix = first_page.get_pixmap(matrix=mat)
        
#         # Convert to PNG bytes
#         cover_image_bytes = pix.tobytes("png")
        
#         # Save as cover image
#         cover_filename = f"cover_page_0.png"
#         resource.cover_image.save(
#             cover_filename,
#             ContentFile(cover_image_bytes),
#             save=False  # Don't save yet, we'll save at the end
#         )

#     for i,page in enumerate(doc):
#         print(f'page:{i}------{page}')
#         content=page.get_text("dict")
#         blocks=content["blocks"]
#         for j, block in enumerate(blocks):
#             if block["type"]==1:
#                 image_bytes=block["image"]
#                 image_ext= block["ext"]

#                 filename=f"image_page_{i}_block_{j}.{image_ext}"
#                 file_path= image_dir/filename

#                 with open(file_path, "wb") as f: 
#                     f.write(image_bytes)
#                 relative_url = f"{settings.MEDIA_URL}resources/{resource.id}/{filename}"

#                 block["src"] = request.build_absolute_uri(relative_url)
#                 del block["image"]
#                 del block["ext"]
#         Page.objects.create(
#             resource=resource,
#             page_number=i,
#             width=content["width"],
#             height= content["height"],
#             data=blocks
#         )
    
#     # Update resource with page count and mark as ready
#     resource.no_of_pages = len(doc)
#     resource.processing_status = 'ready'
#     resource.save()
    
#     return {"message": "Books splitted"}
