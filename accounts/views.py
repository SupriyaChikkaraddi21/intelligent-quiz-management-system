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
from .serializers import UserProfileSerializer


# -------------------------------------------------------------
# REGISTER (returns token)
# -------------------------------------------------------------
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username & password required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)

    # Create User
    user = User.objects.create_user(username=username, password=password)

    # Create Profile
    UserProfile.objects.get_or_create(user=user)

    # Create token
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "success": True,
        "message": "User registered successfully",
        "token": token.key
    }, status=201)


# -------------------------------------------------------------
# LOGIN (returns token)
# -------------------------------------------------------------
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if not user:
        return Response({"error": "Invalid username or password"}, status=401)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "success": True,
        "message": "Login successful",
        "token": token.key
    }, status=200)


# -------------------------------------------------------------
# PROFILE VIEWSET (get + update + avatar upload)
# -------------------------------------------------------------
@method_decorator(csrf_exempt, name="dispatch")
class AccountViewSet(viewsets.ViewSet):

    permission_classes = [IsAuthenticated]

    # GET PROFILE
    def list(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    # UPDATE PROFILE
    def create(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "message": "Profile updated"})

        return Response(serializer.errors, status=400)

    # UPLOAD AVATAR
    @action(detail=False, methods=["post"])
    def avatar(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        file = request.FILES.get("avatar")
        if not file:
            return Response({"error": "No image uploaded"}, status=400)

        profile.avatar = file
        profile.save()

        return Response({
            "success": True,
            "avatar_url": request.build_absolute_uri(profile.avatar.url)
        })
