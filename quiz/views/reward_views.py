from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..services.reward_service import RewardService


# ======================================================
# REWARDS (LIST + REDEEM)
# ======================================================

class RewardsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = RewardService.get_rewards(request.user)
        return Response(data)


class RedeemRewardView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = RewardService.redeem_reward(
                request.user,
                request.data.get("code")
            )
            return Response(data)

        except ValueError as e:
            return Response({"error": str(e)}, status=400)
