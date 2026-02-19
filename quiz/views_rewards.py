from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication

from accounts.models import UserReward
from .rewards import REWARD_CATALOG
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import status

from accounts.models import UserReward


class RewardListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reward, _ = UserReward.objects.get_or_create(user=request.user)

        data = []
        for code, r in REWARD_CATALOG.items():
            data.append({
                "code": code,
                "label": r["label"],
                "cost": r["cost"],
                "unlocked": getattr(reward, r["field"]),
            })

        return Response({
            "points": reward.points,
            "rewards": data
        })


class RewardRedeemView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        reward_type = request.data.get("type")
        cost = request.data.get("cost")

        if not reward_type or not cost:
            return Response(
                {"error": "Invalid reward data"},
                status=status.HTTP_400_BAD_REQUEST
            )

        reward = UserReward.objects.get(user=request.user)

        if reward.points < cost:
            return Response(
                {"error": "Not enough points"},
                status=status.HTTP_400_BAD_REQUEST
            )

        reward.points -= cost
        reward.save()

        return Response({
            "success": True,
            "remaining_points": reward.points
        })
