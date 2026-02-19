from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response

from gamification.services.gamification_service import GamificationService


# ======================================================
# USER GAMIFICATION
# ======================================================

class UserGamificationView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = GamificationService.get_user_status(request.user)
        return Response(data)
