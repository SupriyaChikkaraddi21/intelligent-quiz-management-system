from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from leaderboard.services.leaderboard_service import LeaderboardService



# ======================================================
# LEADERBOARD
# ======================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard_view(request):
    data = LeaderboardService.global_leaderboard()
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard_weekly_view(request):
    data = LeaderboardService.weekly_leaderboard()
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard_monthly_view(request):
    data = LeaderboardService.monthly_leaderboard()
    return Response(data)
