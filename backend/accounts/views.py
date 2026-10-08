
# Create your views here.
from django.contrib.auth.models import User
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.conf import settings 
from rest_framework.permissions import AllowAny

class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Create user but mark as inactive
        user = User.objects.create_user(username=email, email=email, password=password)
        user.is_active = False
        user.save()

        # Generate verification token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create verification link (adjust domain for production)
        verify_link = f"{settings.FRONTEND_URL}/verify/{uid}/{token}/"
        html_content= render_to_string(
            "emails/verify_email.html", 
            {
                "verification_url":verify_link, 
                "expiry_minutes":30
            }
        )
        email_message = EmailMultiAlternatives(
            subject="Verify your email — Welcome to Jharo",
            body=(
                "Welcome to Jharo!\n\n"
                "Please verify your email to finish "
                "creating your account.\n\n"
                f"Verify your email: {verify_link}"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )

        # Attach HTML version
        email_message.attach_alternative(
            html_content,
            "text/html",
        )

        # Send
        email_message.send(fail_silently=False)
        return Response({"message": "Check your email for the verification link."}, status=status.HTTP_201_CREATED)

class VerifyEmailView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            print(user)
            print("email is verified")
            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid verification link."}, status=status.HTTP_400_BAD_REQUEST)




class LoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        password = request.data.get('password')
        account = User.objects.filter(email__iexact=email).first()
        user = authenticate(
            request=request,
            username=account.username if account else email,
            password=password,
        )
        
        if user is not None:
            if not user.is_active:
                return Response({"error": "Please verify your email first."}, status=status.HTTP_403_FORBIDDEN)
            
            refresh = RefreshToken.for_user(user)
            response = Response({"message": "Login successful"})
            
            # Set access token cookie
            response.set_cookie(
                key='access',
                value=str(refresh.access_token),
                httponly=True,
                secure=False, # Set to True in production with HTTPS
                samesite='Lax'
            )
            # Set refresh token cookie
            response.set_cookie(
                key='refresh',
                value=str(refresh),
                httponly=True,
                secure=False, # Set to True in production
                samesite='Lax'
            )
            return response
            
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

class CookieTokenRefreshView(APIView):
    # An expired access cookie must not block a valid refresh cookie from being used.
    authentication_classes = []
    permission_classes=[AllowAny,]
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh')
        if not refresh_token:
            return Response({"error": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            refresh = RefreshToken(refresh_token)
            response = Response({"message": "Token refreshed"})
            response.set_cookie(
                key='access',
                value=str(refresh.access_token),
                httponly=True,
                secure=False,
                samesite='Lax'
            )
            return response
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        response = Response({"message": "Successfully logged out."})
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        })
