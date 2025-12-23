# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     QuizViewSet,
#     CategoryViewSet,
#     SubcategoryViewSet,
#     AttemptViewSet,
#     leaderboard_view,
#     CategoryGroupListView,
#     UserAnalyticsView,
# )

# router = DefaultRouter()
# # router.register(r"quiz", QuizViewSet, basename="quiz")
# router.register(r"", QuizViewSet, basename="quiz")
# router.register(r"categories", CategoryViewSet, basename="categories")
# router.register(r"subcategories", SubcategoryViewSet, basename="subcategories")
# router.register(r"attempt", AttemptViewSet, basename="attempt")

# urlpatterns = [
#     path("", include(router.urls)),
#     path("leaderboard/", leaderboard_view),
#     path("category-groups/", CategoryGroupListView.as_view()),
#     path("user/analytics/", UserAnalyticsView.as_view()),
# ]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizViewSet,
    CategoryViewSet,
    SubcategoryViewSet,
    AttemptViewSet,
    leaderboard_view,
    CategoryGroupListView,
    UserAnalyticsView,
    UserDashboardView,
    UserProgressView,
)

# Routers (ONE RESPONSIBILITY EACH)
quiz_router = DefaultRouter()
quiz_router.register(r"quiz", QuizViewSet, basename="quiz")

attempt_router = DefaultRouter()
attempt_router.register(r"attempt", AttemptViewSet, basename="attempt")

category_router = DefaultRouter()
category_router.register(r"categories", CategoryViewSet, basename="categories")
category_router.register(r"subcategories", SubcategoryViewSet, basename="subcategories")

urlpatterns = [
    # Quiz lifecycle
    path("", include(quiz_router.urls)),

    # Attempts
    path("", include(attempt_router.urls)),

    # Categories
    path("", include(category_router.urls)),

    # Groups
    path("category-groups/", CategoryGroupListView.as_view()),

    # User analytics
    path("user/analytics/", UserAnalyticsView.as_view()),
    path("user/dashboard/", UserDashboardView.as_view()),
    path("user/progress/", UserProgressView.as_view()),

    # Leaderboard
    path("leaderboard/", leaderboard_view),
]
