import boto3
from django.conf import settings

def get_s3_client():
    return boto3.client(
        "s3", 
        region_name= settings.AWS_S3_REGION_NAME
    )

def create_upload_url(
        object_key: str
) -> str:
    """
    Generate a short-lived URL for uploading one PDF object.
    """

    return get_s3_client().generate_presigned_url(
        ClientMethod="put_object", 
        Params={
            "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
            "Key": object_key,
            "ContentType":"application/pdf",
        }, 
        ExpiresIn=settings.S3_PRESIGNED_URL_TTL, 
        HttpMethod="PUT"
    )

def get_object_metadata(
        object_key:str
) ->dict:

    response= get_s3_client().head_object(
        Bucket=settings.AWS_STORAGE_BUCKET_NAME, 
        Key=object_key
    )
    return {
        "size_bytes": response["ContentLength"], 
        "content_type": response.get("ContentType", ""), 
        "etag":response.get("ETag", ""),
    }


def delete_s3_object(
        object_key:str
) -> None:
    get_s3_client().delete_object(
        Bucket= settings.AWS_STORAGE_BUCKET_NAME, 
        Key=object_key
    )

def create_download_url(
        object_key: str, 
        expires_in:int = 300
) ->str:
    return get_s3_client().generate_presigned_url(
        ClientMethod="get_object", 
        Params={
            "Bucket":settings.AWS_STORAGE_BUCKET_NAME, 
            "Key":object_key
        }, 
        ExpiresIn=expires_in
    )
