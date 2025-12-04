# accounts/views.py

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import viewsets, status

from .models import UserProfile
from .serializers import (
    UserRegisterSerializer,
    UserProfileSerializer,
    ProfileUpdateSerializer,
    AvatarUploadSerializer,
)

import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


# ==============================================================
#  REGISTER (Email + Password)  —  SIMPLE + CLEAN
# ==============================================================

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    Input:
    {
        "name": "Full Name",
        "email": "abc@gmail.com",
        "password": "123456"
    }
    """

    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    if not name or not email or not password:
        return Response({"error": "All fields are required"}, status=400)

    if User.objects.filter(username=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    # Create a normal Django user
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name,
        is_active=True
    )

    # Create user profile
    UserProfile.objects.get_or_create(user=user)

    # Create token
    token, _ = Token.objects.get_or_create(user=user)

    return Response({"success": True, "token": token.key}, status=201)


# ==============================================================
#  LOGIN (Email + Password)
# ==============================================================

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Input:
    {
        "email": "abc@gmail.com",
        "password": "123456"
    }
    """

    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    user = authenticate(username=email, password=password)

    if not user:
        return Response({"error": "Invalid email or password"}, status=401)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({"success": True, "token": token.key}, status=200)


# ==============================================================
#  GOOGLE LOGIN (Already working + polished)
# ==============================================================

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def google_login_view(request):
    """
    Input:
    {
        "credential": "<google_id_token>"
    }
    """

    google_token = request.data.get("credential")
    if not google_token:
        return Response({"error": "Missing Google credential"}, status=400)

    CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    if not CLIENT_ID:
        return Response({"error": "Server missing GOOGLE_CLIENT_ID"}, status=500)

    try:
        # Verify Google token
        info = id_token.verify_oauth2_token(
            google_token,
            google_requests.Request(),
            CLIENT_ID
        )

        email = info.get("email")
        name = info.get("name", "")

        if not email:
            return Response({"error": "Google did not return an email"}, status=400)

        # Get or create user
        user, created = User.objects.get_or_create(
            username=email,
            defaults={"email": email, "first_name": name, "is_active": True}
        )

        if created:
            # Google users have no password
            user.set_unusable_password()
            user.save()
            UserProfile.objects.get_or_create(user=user)

        # Issue token
        token, _ = Token.objects.get_or_create(user=user)

        return Response({"success": True, "token": token.key})

    except ValueError:
        return Response({"error": "Invalid Google token"}, status=401)

    except Exception as e:
        print("GOOGLE LOGIN ERROR:", e)
        return Response({"error": "Google login failed"}, status=500)


# ==============================================================
#  PROFILE (GET / UPDATE / AVATAR)
# ==============================================================

@method_decorator(csrf_exempt, name="dispatch")
class AccountViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    # ----------- GET PROFILE (GET /api/accounts/profile/) ----------
    def list(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    # ----------- UPDATE PROFILE (POST /api/accounts/profile/) -------
    def create(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"success": True})

        return Response(serializer.errors, status=400)

    # ----------- UPLOAD AVATAR (POST /api/accounts/profile/avatar/) -
    @action(detail=False, methods=["POST"])
    def avatar(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        file = request.FILES.get("avatar")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        profile.avatar = file
        profile.save()

        return Response({
            "success": True,
            "avatar_url": request.build_absolute_uri(profile.avatar.url)
        })
