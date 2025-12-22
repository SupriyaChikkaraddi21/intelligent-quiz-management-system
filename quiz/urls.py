from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    SubcategoryViewSet,
    QuizViewSet,
    AttemptViewSet,
    leaderboard_view,
    UserAnalyticsView,
    CategoryGroupListView,
)

router = DefaultRouter()

router.register(r"", QuizViewSet, basename="quiz")
router.register(r"categories", CategoryViewSet, basename="categories")
router.register(r"subcategories", SubcategoryViewSet, basename="subcategories")
router.register(r"attempt", AttemptViewSet, basename="attempt")

urlpatterns = [
    path("", include(router.urls)),

    # ✅ EXTRA APIs (explicit & clear)
    path("leaderboard/", leaderboard_view),
    path("user/analytics/", UserAnalyticsView.as_view()),
    path("category-groups/", CategoryGroupListView.as_view()),
]
