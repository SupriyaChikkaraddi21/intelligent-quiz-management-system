from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


# ==============================================================
# BASIC USER REGISTER SERIALIZER (USED ONLY IN register_view)
# ==============================================================

class UserRegisterSerializer(serializers.ModelSerializer):
    """Handles registration for email + password signup."""
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "password")  # username removed

    def create(self, validated_data):
        email = validated_data["email"]

        # Use email as username
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
            is_active=True,
        )

        # Create user profile
        UserProfile.objects.get_or_create(user=user)
        return user


# ==============================================================
# USER PROFILE SERIALIZER (READ-ONLY PROFILE)
# ==============================================================

class UserProfileSerializer(serializers.ModelSerializer):
    """Profile data returned to frontend."""
    email = serializers.CharField(source="user.email", read_only=True)
    name = serializers.CharField(source="user.first_name", read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            "email",
            "name",
            "full_name",
            "avatar",
            "preferences",
            "last_login_ip",
            "last_active",
        )


# ==============================================================
# PROFILE UPDATE SERIALIZER (NAME + PREFERENCES)
# ==============================================================

class ProfileUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=False)

    class Meta:
        model = UserProfile
        fields = ("full_name", "preferences")


# ==============================================================
# AVATAR UPLOAD SERIALIZER
# ==============================================================

class AvatarUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ("avatar",)
