from django.urls import path
from gamification.views.gamification_views import UserGamificationView

urlpatterns = [
    path("user/gamification/", UserGamificationView.as_view(), name="user-gamification"),
]
