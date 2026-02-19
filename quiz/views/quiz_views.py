from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Avg, Sum

from rest_framework import viewsets, mixins, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsUser
from accounts.models import UserReward, Classroom

from categories.models import CategoryGroup

from ..models import (
    Category,
    Subcategory,
    Quiz,
    
    QuizAttempt,
    QuestionTemplate,
    QuestionAttempt,
)

from ..serializers import (
    CategorySerializer,
    SubcategorySerializer,
    QuizSerializer,
    QuizAttemptSerializer,
    CategoryGroupSerializer,
    UserQuizCreateSerializer,
    
)

from ..services.points import calculate_points
from ..services.attempt_service import AttemptService
from gamification.services.gamification_service import GamificationService
from leaderboard.services.leaderboard_service import LeaderboardService



from ..services.reward_service import RewardService
from classroom.services.assignment_service import AssignmentService

from ..services.quiz_generation_service import QuizGenerationService


from ai.services.ai_service import AIService
from classroom.models import QuizAssignment

from categories.models import CategoryGroup


# ======================================================
# CATEGORY & SUBCATEGORY
# ======================================================

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SubcategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer


# ======================================================
# CATEGORY GROUPS & LEADERBOARD
# ======================================================

class CategoryGroupListView(generics.ListAPIView):
    queryset = CategoryGroup.objects.prefetch_related("categories")
    serializer_class = CategoryGroupSerializer
