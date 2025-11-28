from django.urls import path
from .views import register_view, login_view, AccountViewSet

account = AccountViewSet.as_view

urlpatterns = [
    # -------------------------
    # Authentication
    # -------------------------
    path("register/", register_view),
    path("login/", login_view),

    # -------------------------
    # Profile: Get + Update
    # GET  → profile/
    # POST → profile/
    # -------------------------
    path("profile/", account({
        "get": "list",
        "post": "create"
    })),

    # -------------------------
    # Avatar Upload
    # POST → profile/avatar/
    # -------------------------
    path("profile/avatar/", account({
        "post": "avatar"
    })),
]
