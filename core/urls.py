# core/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [

    path("admin/", admin.site.urls),

    # ACCOUNTS (register, login, google-login, profile, avatar)
    path("api/accounts/", include("accounts.urls")),

    # QUIZ API (dashboard, categories, generate, progress, leaderboard)
    path("api/", include("quiz.urls")),
]

# MEDIA files (profile avatars)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
