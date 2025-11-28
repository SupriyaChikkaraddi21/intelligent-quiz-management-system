from django.urls import path
from .views import (
    CategoryViewSet, SubcategoryViewSet,
    QuizViewSet, AttemptViewSet
)

quiz = QuizViewSet.as_view
attempt = AttemptViewSet.as_view

urlpatterns = [

    # Category & Subcategory
    path("categories/", CategoryViewSet.as_view({"get": "list"})),
    path("subcategories/", SubcategoryViewSet.as_view({"get": "list"})),

    # Dashboard, Progress, Leaderboard
    path("quizzes/dashboard/", quiz({"get": "dashboard"})),
    path("quizzes/progress/", quiz({"get": "progress"})),
    path("quizzes/leaderboard/", quiz({"get": "leaderboard"})),

    # Generate quiz
    path("quizzes/generate/", quiz({"post": "generate"})),

    # Start quiz attempt
    path("quizzes/<uuid:pk>/start/", quiz({"post": "start"})),

    # Attempt APIs
    path("attempts/<uuid:pk>/details/", attempt({"get": "details"})),
    path("attempts/<uuid:pk>/answer/", attempt({"post": "answer"})),
    path("attempts/<uuid:pk>/finish/", attempt({"post": "finish"})),
]
