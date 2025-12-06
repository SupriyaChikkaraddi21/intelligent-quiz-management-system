# quiz/views.py

from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

from django.db import models
from django.utils import timezone
import logging

from .models import (
    Category,
    Subcategory,
    QuestionTemplate,
    Quiz,
    QuizAttempt,
    QuestionAttempt
)

from .serializers import (
    CategorySerializer,
    SubcategorySerializer,
    QuizAttemptSerializer,
)

from .generate_quiz import generate_questions

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
# QUIZ VIEWSET (Using GenericViewSet FIXES /dashboard/)
# ======================================================

class QuizViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = Quiz.objects.all()  # REQUIRED for GenericViewSet

    # ---------------------- DASHBOARD ----------------------
    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        try:
            user = request.user
            attempts = QuizAttempt.objects.filter(user=user).order_by("-started_at")

            total_quizzes = attempts.count()
            avg_score = attempts.aggregate(avg=models.Avg("score"))["avg"] or 0
            avg_score = round(avg_score, 2)

            recent_attempts = attempts[:5]
            recent_data = QuizAttemptSerializer(recent_attempts, many=True).data

            progress_qs = QuizAttempt.objects.filter(user=user).order_by("started_at")
            progress_data = [
                {"date": a.started_at.isoformat(), "score": a.score}
                for a in progress_qs
            ]

            return Response({
                "total_quizzes": total_quizzes,
                "average_score": avg_score,
                "recent_scores": recent_data,
                "progress_scores": progress_data,
            })

        except Exception as e:
            logger.exception("DASHBOARD ERROR: %s", e)
            return Response({"detail": "Dashboard error"}, status=500)

    # ---------------------- GENERATE QUIZ ----------------------
    @action(detail=False, methods=["post"])
    def generate(self, request):
        try:
            category_id = request.data.get("category")
            subcategory_id = request.data.get("subcategory")
            difficulty = request.data.get("difficulty", "Medium")
            count = int(request.data.get("count", 5))

            category = Category.objects.get(id=category_id)
            subcat = Subcategory.objects.get(id=subcategory_id) if subcategory_id else None

            topic = subcat.name if subcat else category.name

            ai_questions = generate_questions(topic, difficulty, count)
            if not ai_questions:
                return Response({"error": "AI generation failed"}, status=500)

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

            # ⭐ TIME PER QUESTION = 60 seconds
            TIME_PER_Q = 60
            time_limit = count * TIME_PER_Q

            quiz = Quiz.objects.create(
                title=f"{topic} Quiz",
                category=category,
                subcategory=subcat,
                difficulty=difficulty,
                question_templates=template_ids,
                time_limit=time_limit
            )

            return Response({"quiz_id": str(quiz.id)}, status=201)

        except Exception as e:
            logger.exception("GENERATE ERROR: %s", e)
            return Response({"error": "Internal server error"}, status=500)

    # ---------------------- START ATTEMPT ----------------------
    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        try:
            quiz = Quiz.objects.get(id=pk)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found"}, status=404)

        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            user=request.user,
            started_at=timezone.now(),
        )

        for qid in quiz.question_templates:
            try:
                qt = QuestionTemplate.objects.get(id=qid)
                QuestionAttempt.objects.create(
                    quiz_attempt=attempt,
                    question=qt,
                    selected_choice=-1,
                )
            except QuestionTemplate.DoesNotExist:
                continue

        return Response({"attempt": QuizAttemptSerializer(attempt).data}, status=201)


# ======================================================
# ATTEMPT VIEWSET (Also fixed with GenericViewSet)
# ======================================================

class AttemptViewSet(
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = QuizAttempt.objects.all()  # REQUIRED

    # ---------------------- DETAILS ----------------------
    @action(detail=True, methods=["get"])
    def details(self, request, pk=None):
        try:
            attempt = QuizAttempt.objects.get(id=pk, user=request.user)
        except QuizAttempt.DoesNotExist:
            return Response({"error": "Attempt not found"}, status=404)

        questions = []
        for qa in attempt.question_attempts.all():
            questions.append({
                "question_id": str(qa.question.id),
                "question_text": qa.question.question_text,
                "choices": qa.question.choices,
                "selected": qa.selected_choice,
                "correct_choice": qa.question.correct_choice,
                "explanation": qa.question.explanation or "",
            })

        return Response({
            "attempt_id": str(attempt.id),
            "quiz_title": attempt.quiz.title,
            "questions": questions,
            "score": attempt.score,
            "completed": attempt.completed,
            "time_limit": attempt.quiz.time_limit,
            "started_at": attempt.started_at.isoformat(),
        })

    # ---------------------- SAVE ANSWER ----------------------
    @action(detail=True, methods=["post"])
    def answer(self, request, pk=None):
        qid = request.data.get("question_id")
        selected = int(request.data.get("selected"))

        try:
            qa = QuestionAttempt.objects.get(
                quiz_attempt_id=pk,
                question_id=qid
            )
        except QuestionAttempt.DoesNotExist:
            return Response({"error": "Invalid question"}, status=404)

        qa.selected_choice = selected
        qa.is_correct = (selected == qa.question.correct_choice)
        qa.save()

        return Response({"saved": True})

    # ---------------------- FINISH ----------------------
    @action(detail=True, methods=["post"])
    def finish(self, request, pk=None):
        try:
            attempt = QuizAttempt.objects.get(id=pk, user=request.user)
        except QuizAttempt.DoesNotExist:
            return Response({"error": "Invalid attempt"}, status=404)

        total = attempt.question_attempts.count()
        correct = attempt.question_attempts.filter(is_correct=True).count()

        score = round((correct / total) * 100, 2) if total > 0 else 0

        attempt.score = score
        attempt.completed = True
        attempt.finished_at = timezone.now()
        attempt.save()

        return Response({"score": score})
