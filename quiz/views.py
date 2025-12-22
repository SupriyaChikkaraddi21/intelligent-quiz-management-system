# quiz/views.py

from rest_framework import viewsets, mixins, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView

from django.db import models
from django.utils import timezone
import logging
import json

from .models import (
    Category,
    Subcategory,
    QuestionTemplate,
    Quiz,
    QuizAttempt,
    QuestionAttempt,
)

from .serializers import (
    CategorySerializer,
    SubcategorySerializer,
    QuizAttemptSerializer,
    CategoryGroupSerializer,
    LeaderboardSerializer,
)

from .generate_quiz import generate_questions
from categories.models import CategoryGroup
from django.db.models import Avg

logger = logging.getLogger(__name__)


# ======================================================
# CATEGORY + SUBCATEGORY
# ======================================================

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SubcategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer


# ======================================================
# QUIZ VIEWSET
# ======================================================

class QuizViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Quiz.objects.all()

    # ---------------------- DASHBOARD ----------------------
    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        user = request.user
        attempts = QuizAttempt.objects.filter(user=user).order_by("-started_at")

        total_quizzes = attempts.count()
        avg_score = round(attempts.aggregate(avg=models.Avg("score"))["avg"] or 0, 2)

        recent_data = QuizAttemptSerializer(attempts[:5], many=True).data

        progress_data = [
            {"date": a.started_at.isoformat(), "score": a.score}
            for a in attempts.order_by("started_at")
        ]

        return Response({
            "total_quizzes": total_quizzes,
            "average_score": avg_score,
            "recent_scores": recent_data,
            "progress_scores": progress_data,
        })

    # ---------------------- ✅ PROGRESS (FOR CHARTS) ----------------------
    @action(detail=False, methods=["get"])
    def progress(self, request):
        attempts = QuizAttempt.objects.filter(
            user=request.user,
            completed=True
        ).order_by("started_at")

        data = [
            {
                "date": a.started_at.strftime("%Y-%m-%d"),
                "score": a.score,
            }
            for a in attempts
        ]

        return Response(data)

    # ---------------------- GENERATE QUIZ ----------------------
    @action(detail=False, methods=["post"])
    def generate(self, request):
        category = Category.objects.get(id=request.data.get("category"))
        subcat_id = request.data.get("subcategory")
        subcat = Subcategory.objects.get(id=subcat_id) if subcat_id else None

        difficulty = request.data.get("difficulty", "medium")
        count = int(request.data.get("count", 5))
        topic = subcat.name if subcat else category.name

        ai_questions = generate_questions(topic, difficulty, count)
        template_ids = []

        for q in ai_questions:
            qt = QuestionTemplate.objects.create(
                category=category,
                subcategory=subcat,
                difficulty=difficulty,
                question_text=q["question"],
                choices=q["choices"],
                correct_choice=q["correct_choice_index"],
                explanation=q.get("explanation", ""),
                references=q.get("references", []),
            )
            template_ids.append(str(qt.id))

        quiz = Quiz.objects.create(
            title=f"{topic} Quiz",
            category=category,
            subcategory=subcat,
            difficulty=difficulty,
            question_templates=template_ids,
            time_limit=count * 60,
        )

        return Response({"quiz_id": str(quiz.id)}, status=201)

    # ---------------------- START QUIZ ----------------------
    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        quiz = Quiz.objects.get(id=pk)

        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            user=request.user,
            current_difficulty="easy",
        )

        for qid in quiz.question_templates:
            qt = QuestionTemplate.objects.get(id=qid)
            QuestionAttempt.objects.create(
                quiz_attempt=attempt,
                question=qt,
                selected_choice=-1,
                is_correct=False,
                difficulty="easy",
            )

        return Response({"attempt": QuizAttemptSerializer(attempt).data})


# ======================================================
# ATTEMPT VIEWSET
# ======================================================

class AttemptViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = QuizAttempt.objects.all()

    @action(detail=True, methods=["post"])
    def finish(self, request, pk=None):
        attempt = QuizAttempt.objects.get(id=pk, user=request.user)

        weights = {"easy": 1, "medium": 2, "hard": 3}
        total, max_score = 0, 0

        for qa in attempt.question_attempts.all():
            w = weights.get(qa.difficulty or "easy", 1)
            max_score += w
            if qa.is_correct:
                total += w

        attempt.score = round((total / max_score) * 100, 2)
        attempt.completed = True
        attempt.finished_at = timezone.now()
        attempt.save()

        return Response({"score": attempt.score})


# ======================================================
# USER ANALYTICS
# ======================================================

# class UserAnalyticsView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         attempts = QuizAttempt.objects.filter(user=request.user)

#         progress_graph = [
#             {"date": a.started_at.strftime("%Y-%m-%d"), "score": a.score}
#             for a in attempts
#         ]

#         return Response({
#             "total_quizzes": attempts.count(),
#             "average_score": round(attempts.aggregate(avg=Avg("score"))["avg"] or 0, 2),
#             "progress_graph": progress_graph,
#         })
class UserAnalyticsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        attempts = QuizAttempt.objects.filter(
            user=user,
            completed=True
        ).order_by("started_at")

        total_quizzes = attempts.count()

        average_score = round(
            attempts.aggregate(avg=Avg("score"))["avg"] or 0,
            2
        )

        # Progress graph
        progress_graph = [
            {
                "date": a.started_at.strftime("%Y-%m-%d"),
                "score": a.score,
            }
            for a in attempts
        ]

        # Lifetime accuracy
        qas = QuestionAttempt.objects.filter(
            quiz_attempt__in=attempts
        )
        total_questions = qas.count()
        correct_answers = qas.filter(is_correct=True).count()

        lifetime_accuracy = (
            round((correct_answers / total_questions) * 100, 2)
            if total_questions else 0
        )

        # Difficulty accuracy
        difficulty_accuracy = {
            "easy": 0,
            "medium": 0,
            "hard": 0,
        }

        for diff in ["easy", "medium", "hard"]:
            diff_qs = qas.filter(difficulty=diff)
            if diff_qs.exists():
                difficulty_accuracy[diff] = round(
                    (diff_qs.filter(is_correct=True).count() / diff_qs.count()) * 100,
                    2
                )

        # Recommendations
        recommendations = []

        if difficulty_accuracy["medium"] < 50:
            recommendations.append("Improve medium-level fundamentals.")
        if difficulty_accuracy["hard"] < 40:
            recommendations.append("Practice core concepts before hard quizzes.")
        if average_score < 50:
            recommendations.append("Review explanations for incorrect answers.")

        if not recommendations:
            recommendations.append("Excellent consistency across difficulty levels!")

        return Response({
            "total_quizzes": total_quizzes,
            "average_score": average_score,
            "lifetime_accuracy": lifetime_accuracy,
            "progress_graph": progress_graph,
            "difficulty_accuracy": difficulty_accuracy,
            "recommendations": recommendations,
        })


# ======================================================
# CATEGORY GROUPS
# ======================================================

class CategoryGroupListView(generics.ListAPIView):
    queryset = CategoryGroup.objects.prefetch_related("categories")
    serializer_class = CategoryGroupSerializer


# ======================================================
# LEADERBOARD
# ======================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard_view(request):
    leaderboard = (
        QuizAttempt.objects
        .filter(completed=True)
        .values("user_id", "user__username")
        .annotate(avg_score=Avg("score"))
        .order_by("-avg_score")
    )

    data = [
        {
            "user_id": row["user_id"],
            "username": row["user__username"],
            "avg_score": round(row["avg_score"], 2),
        }
        for row in leaderboard
    ]

    return Response(LeaderboardSerializer(data, many=True).data)
