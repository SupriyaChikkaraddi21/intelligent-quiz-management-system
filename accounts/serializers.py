from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


# ==============================================================
# BASIC USER REGISTER SERIALIZER (USED ONLY IN register_view)
# ==============================================================

class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Handles registration for email + password signup.
    Role is NOT exposed here (always defaults to 'user').
    """
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

        # Create user profile (role defaults to 'user')
        UserProfile.objects.get_or_create(user=user)
        return user


# ==============================================================
# USER PROFILE SERIALIZER (READ-ONLY PROFILE + ROLE + REWARDS)
# ==============================================================

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Profile data returned to frontend.
    SAFE: role & rewards are read-only.
    """
    email = serializers.CharField(source="user.email", read_only=True)
    name = serializers.CharField(source="user.first_name", read_only=True)

    # 🔥 ROLE (READ-ONLY — RBAC)
    role = serializers.CharField(read_only=True)

    # 🔥 Rewards (READ-ONLY)
    coins = serializers.IntegerField(read_only=True)
    mystery_boxes = serializers.IntegerField(read_only=True)

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

            # 🔥 ROLE
            "role",

            # 🔥 REWARDS
            "coins",
            "mystery_boxes",
        )


# ==============================================================
# PROFILE UPDATE SERIALIZER (USER SAFE — NO ROLE / REWARDS)
# ==============================================================

class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Allows user to update ONLY personal info.
    """
    full_name = serializers.CharField(required=False)

    class Meta:
        model = UserProfile
        fields = (
            "full_name",
            "preferences",
        )

def save(self, *args, **kwargs):
    # Keep Django permissions in sync with role
    if self.role == "admin":
        self.user.is_staff = True
    else:
        self.user.is_staff = False

    self.user.save(update_fields=["is_staff"])
    super().save(*args, **kwargs)

# ==============================================================
# AVATAR UPLOAD SERIALIZER
# ==============================================================

class AvatarUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ("avatar",)
