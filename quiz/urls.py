from django.urls import path, include
from rest_framework.routers import DefaultRouter

# ---------------- VIEWSETS ----------------

from .views.quiz_management_views import QuizManagementViewSet
from .views.quiz_generation_views import QuizGenerationViewSet
from .views.attempt_views import AttemptViewSet
from .views.quiz_teacher_views import QuizTeacherViewSet
from .views.quiz_views import CategoryViewSet, SubcategoryViewSet, CategoryGroupListView

# ---------------- ANALYTICS ----------------

from .views.analytics_views import (
    UserAnalyticsView,
    UserDashboardView,
    UserProgressView,
    UserDifficultyRecommendationView,
    )





# ---------------- REWARDS ----------------

from .views.reward_views import RewardsView, RedeemRewardView



# ---------------- HISTORY ----------------

from .views_history import quiz_history

from .views.password_reset_views import (
    PasswordResetRequestView,
    PasswordResetConfirmView,
)


# ======================================================
# ROUTERS
# ======================================================

router = DefaultRouter()

# IMPORTANT: generation must use SAME base "quiz"
router.register(r"quiz", QuizGenerationViewSet, basename="quiz-generate")

# management endpoints under different base
router.register(r"quiz-management", QuizManagementViewSet, basename="quiz-management")

router.register(r"attempt", AttemptViewSet, basename="attempt")
router.register(r"quiz-teacher", QuizTeacherViewSet, basename="quiz-teacher")

router.register(r"categories", CategoryViewSet, basename="categories")
router.register(r"subcategories", SubcategoryViewSet, basename="subcategories")


# ======================================================
# URL PATTERNS
# ======================================================

urlpatterns = [

    

    # ---------------- ROUTER URLS ----------------

    path("", include(router.urls)),

    # ---------------- HISTORY ----------------

    path("history/", quiz_history, name="user-history"),

    # ---------------- CATEGORY GROUPS ----------------

    path("category-groups/", CategoryGroupListView.as_view()),

    # ---------------- USER ANALYTICS ----------------

    path("user/analytics/", UserAnalyticsView.as_view()),
    path("user/dashboard/", UserDashboardView.as_view()),
    path("user/progress/", UserProgressView.as_view()),
    path("user/difficulty/", UserDifficultyRecommendationView.as_view()),
    
    
    # ---------------- REWARDS ----------------

    path("rewards/", RewardsView.as_view()),
    path("rewards/redeem/", RedeemRewardView.as_view()),

    path("auth/password-reset/", PasswordResetRequestView.as_view()),
    path("auth/password-reset-confirm/", PasswordResetConfirmView.as_view()),


]
