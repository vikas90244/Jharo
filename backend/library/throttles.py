from rest_framework.throttling import UserRateThrottle


class UploadInitiateThrottle(UserRateThrottle):
    scope = "upload_initiate"