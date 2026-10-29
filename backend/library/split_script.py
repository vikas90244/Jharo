import os
import django
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

import requests
from django.conf import settings
from library.s3 import create_download_url
from library.splitter import split_resource_into_pages
from library.models import Resource

print("Bucket:", settings.AWS_STORAGE_BUCKET_NAME)
print("Region:", settings.AWS_S3_REGION_NAME)

object_key = (
    "books/4f05fec9-dddb-45f8-8678-a97b2da2cedb/"
    "6984755e-dfae-44aa-ba58-b6477ee66b09.pdf"
)

# Generate a presigned URL
url = create_download_url(object_key)

print(url)
# Save the PDF inside Django's media directory
media_dir = Path(settings.MEDIA_ROOT)
file_path = media_dir / object_key
file_path.parent.mkdir(parents=True, exist_ok=True)
# Download the PDF in 1 MB chunks
with requests.get(url, stream=True, timeout=60) as response:
    response.raise_for_status()

    with open(file_path, "wb") as file:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                file.write(chunk)

print(f"PDF downloaded successfully: {file_path}")

resource= Resource.objects.get(object_key=object_key)
res_id= resource.id 
split_resource_into_pages(res_id)