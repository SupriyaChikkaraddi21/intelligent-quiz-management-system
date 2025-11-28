from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # Keep existing API mount
    path("api/accounts/", include("accounts.urls")),

    # ALSO expose plain /accounts/ so frontend calls work
    path("accounts/", include("accounts.urls")),

    # Quiz API
    path("api/", include("quiz.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
