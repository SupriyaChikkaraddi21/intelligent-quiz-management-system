from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response

from analytics.services.user_analytics_service import UserAnalyticsService


# ======================================================
# USER DASHBOARD
# ======================================================

class UserDashboardView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = UserAnalyticsService.get_dashboard(request.user)
        return Response(data)


# ======================================================
# USER PROGRESS
# ======================================================

class UserProgressView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = UserAnalyticsService.get_progress(request.user)
        return Response(data)


# ======================================================
# USER ANALYTICS
# ======================================================

class UserAnalyticsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = UserAnalyticsService.get_analytics(request.user)
        return Response(data)


# ======================================================
# USER DIFFICULTY RECOMMENDATION
# ======================================================

class UserDifficultyRecommendationView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = UserAnalyticsService.get_recommended_difficulty(request.user)
        return Response(data)
