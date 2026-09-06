import pymupdf
from .models import Resource, Page
from pathlib import Path 
from django.conf import settings
# import json

def split_resource(id, request):
    resource=Resource.objects.get(id=id)
    image_dir=Path(settings.MEDIA_ROOT)/"resources"/str(resource.id)

    image_dir.mkdir(parents=True, exist_ok=True)

    doc=pymupdf.open(resource.object_path.path)
    

    for i,page in enumerate(doc):
        print(f'page:{i}------{page}')
        content=page.get_text("dict")
        blocks=content["blocks"]
        for j, block in enumerate(blocks):
            if block["type"]==1:
                image_bytes=block["image"]
                image_ext= block["ext"]

                filename=f"image_page_{i}_block_{j}.{image_ext}"
                file_path= image_dir/filename

                with open(file_path, "wb") as f: 
                    f.write(image_bytes)
                relative_url = f"{settings.MEDIA_URL}resources/{resource.id}/{filename}"

                block["src"] = request.build_absolute_uri(relative_url)
                del block["image"]
                del block["ext"]
        Page.objects.create(
            resource=resource,
            page_number=i,
            width=content["width"],
            height= content["height"],
            data=blocks
        )
    return {"message": "Books splitted"}