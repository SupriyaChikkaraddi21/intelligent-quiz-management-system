from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


def avatar_upload_path(instance, filename):
    return f"avatars/user_{instance.user.id}/{filename}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    full_name = models.CharField(max_length=100, null=True, blank=True)
    avatar = models.ImageField(upload_to=avatar_upload_path, null=True, blank=True)
    preferences = models.JSONField(default=dict, blank=True)

    # Session tracking
    last_login_ip = models.CharField(max_length=50, blank=True)
    last_active = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.user.username
