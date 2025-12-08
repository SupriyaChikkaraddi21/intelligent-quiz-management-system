# quiz/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    SubcategoryViewSet,
    QuizViewSet,
    AttemptViewSet,
    CategoryGroupListView,
    UserAnalyticsView,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="categories")
router.register(r"subcategories", SubcategoryViewSet, basename="subcategories")
router.register(r"quiz", QuizViewSet, basename="quiz")
router.register(r"attempt", AttemptViewSet, basename="attempt")

urlpatterns = [
    path("", include(router.urls)),
    path("category-groups/", CategoryGroupListView.as_view(), name="category-groups"),
    path("user/analytics/", UserAnalyticsView.as_view(), name="user-analytics"),
]
