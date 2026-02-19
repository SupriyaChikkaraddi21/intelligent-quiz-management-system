from django.urls import path
from leaderboard.views.leaderboard_views import (
    leaderboard_view,
    leaderboard_weekly_view,
    leaderboard_monthly_view,
)

urlpatterns = [
    path("leaderboard/", leaderboard_view),
    path("leaderboard/weekly/", leaderboard_weekly_view),
    path("leaderboard/monthly/", leaderboard_monthly_view),
]
