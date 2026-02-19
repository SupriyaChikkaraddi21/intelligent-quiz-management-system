from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings


def avatar_upload_path(instance, filename):
    return f"avatars/user_{instance.user.id}/{filename}"


class UserProfile(models.Model):
    # -----------------------------
    # CORE USER LINK
    # -----------------------------
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # -----------------------------
    # BASIC PROFILE INFO
    # -----------------------------
    full_name = models.CharField(max_length=100, null=True, blank=True)
    avatar = models.ImageField(upload_to=avatar_upload_path, null=True, blank=True)
    preferences = models.JSONField(default=dict, blank=True)

    # -----------------------------
    # ROLE-BASED ACCESS CONTROL 🔥 (UPDATED SAFELY)
    # -----------------------------
    ROLE_CHOICES = (
        ("student", "Student"),   # default normal user
        ("teacher", "Teacher"),   # can create classroom, assign quizzes
        ("admin", "Admin"),       # full system control
        ("user", "User"),         # legacy support (DO NOT REMOVE)
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student"
    )

    # -----------------------------
    # SESSION TRACKING
    # -----------------------------
    last_login_ip = models.CharField(max_length=50, blank=True)
    last_active = models.DateTimeField(null=True, blank=True)

    # -----------------------------
    # REWARDS SYSTEM (UNCHANGED)
    # -----------------------------
    coins = models.PositiveIntegerField(default=0)
    last_reward_date = models.DateField(null=True, blank=True)
    mystery_boxes = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class UserReward(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reward_profile"
    )

    points = models.IntegerField(default=0)

    # Redeemable rewards
    hard_mode_unlocked = models.BooleanField(default=False)
    no_hints_unlocked = models.BooleanField(default=False)
    gold_badge_unlocked = models.BooleanField(default=False)

    last_reward_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} Rewards ({self.points} pts)"
# ======================================================
# CLASSROOM MODEL (Teacher Mode)
# ======================================================

class Classroom(models.Model):
    name = models.CharField(max_length=100)

    description = models.TextField(blank=True, default="")

    code = models.CharField(
        max_length=6,
        unique=True,
        blank=True,
        default=""
    )

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_classrooms"
    )

    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="joined_classrooms",
        blank=True
    )
