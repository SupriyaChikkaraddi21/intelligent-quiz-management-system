# core/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse  # ✅ added

# ✅ health check for Render
def health_check(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    # ✅ REQUIRED for Render (DO NOT REMOVE)
    path("", health_check),

    # ================= ADMIN =================
    path("admin/", admin.site.urls),

    # ================= API v1 =================
    # Accounts App
    path("api/v1/accounts/", include("accounts.urls")),

    # Quiz App
    path("api/v1/", include("quiz.urls")),

    # Gamification App
    path("api/v1/", include("gamification.urls")),

    # Leaderboard App
    path("api/v1/", include("leaderboard.urls")),

    # Classroom App
    path("api/v1/", include("classroom.urls")),
]

# ================= MEDIA FILES =================
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )