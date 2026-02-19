from django.contrib import admin
from .models import UserProfile, UserReward


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "coins", "mystery_boxes")
    list_filter = ("role",)
    search_fields = ("user__username",)


@admin.register(UserReward)
class UserRewardAdmin(admin.ModelAdmin):
    list_display = ("user", "points", "hard_mode_unlocked")
    search_fields = ("user__username",)
