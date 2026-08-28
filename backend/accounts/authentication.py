from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Check the header first, fallback to cookies
        print("done")
        header = self.get_header(request)
        print(header)
        if header is None:
            raw_token = request.COOKIES.get('access')
            print(raw_token)
        else:
            raw_token = self.get_raw_token(header)
            print(raw_token)

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token