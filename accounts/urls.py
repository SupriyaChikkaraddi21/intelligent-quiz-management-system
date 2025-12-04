# accounts/urls.py

from django.urls import path
from .views import (
    register_view,
    login_view,
    google_login_view,
    AccountViewSet
)

account = AccountViewSet.as_view

urlpatterns = [

    # -------- AUTH --------
    path("register/", register_view, name="register"),
    path("login/", login_view, name="login"),

    # -------- GOOGLE LOGIN --------
    path("google-login/", google_login_view, name="google-login"),

    # -------- PROFILE --------
    path("profile/", account({
        "get": "list",
        "post": "create",
    }), name="profile"),

    path("profile/avatar/", account({
        "post": "avatar",
    }), name="profile-avatar"),
]
