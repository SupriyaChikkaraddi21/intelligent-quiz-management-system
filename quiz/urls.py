# quiz/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    SubcategoryViewSet,
    QuizViewSet,
    AttemptViewSet,
)

router = DefaultRouter()

# Register all routes
router.register(r"categories", CategoryViewSet, basename="categories")
router.register(r"subcategories", SubcategoryViewSet, basename="subcategories")
router.register(r"quiz", QuizViewSet, basename="quiz")
router.register(r"attempt", AttemptViewSet, basename="attempt")

urlpatterns = [
    path("", include(router.urls)),
]
