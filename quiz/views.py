# quiz/views.py

from rest_framework import viewsets, mixins, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

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
)

from .generate_quiz import generate_questions
from categories.models import CategoryGroup

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

            # Force Indian context for ambiguous topics
            origin_hint = ""
            if topic.lower() in ["national", "indian gk", "current affairs", "general knowledge"]:
                origin_hint = "Generate only India-specific questions. Do NOT generate US-related questions."

            ai_questions = generate_questions(topic, difficulty, count, origin_hint=origin_hint)
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

            TIME_PER_Q = 60
            quiz = Quiz.objects.create(
                title=f"{topic} Quiz",
                category=category,
                subcategory=subcat,
                difficulty=difficulty,
                question_templates=template_ids,
                time_limit=count * TIME_PER_Q,
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
                    is_correct=False,
                )
            except QuestionTemplate.DoesNotExist:
                continue

        return Response({"attempt": QuizAttemptSerializer(attempt).data}, status=201)


# ======================================================
# ATTEMPT VIEWSET
# ======================================================

class AttemptViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = QuizAttempt.objects.all()

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

    # ---------------------- SAVE ANSWER (ROBUST & FINAL) ----------------------
    @action(detail=True, methods=["post"])
    def answer(self, request, pk=None):

        qid = request.data.get("question_id")

        try:
            selected = int(request.data.get("selected"))
        except:
            return Response({"error": "Invalid selected value"}, status=400)

        try:
            qa = QuestionAttempt.objects.get(quiz_attempt_id=pk, question_id=qid)
        except QuestionAttempt.DoesNotExist:
            return Response({"error": "Invalid question"}, status=404)

        # Parse choices
        choices = qa.question.choices
        if isinstance(choices, str):
            try:
                choices = json.loads(choices)
            except:
                choices = []

        if not isinstance(choices, list):
            choices = list(choices)

        # Parse correct index
        raw_correct = qa.question.correct_choice
        try:
            correct_index = int(raw_correct)
        except:
            correct_index = choices.index(raw_correct) if raw_correct in choices else -1

        is_correct = False

        # 0-based
        if 0 <= selected < len(choices):
            is_correct = (selected == correct_index)

        # 1-based fallback
        elif 1 <= selected <= len(choices):
            is_correct = ((selected - 1) == correct_index)

        qa.selected_choice = selected
        qa.is_correct = is_correct
        qa.save(update_fields=["selected_choice", "is_correct"])

        return Response({"saved": True, "is_correct": is_correct})

    # ---------------------- FINISH ----------------------
    @action(detail=True, methods=["post"])
    def finish(self, request, pk=None):
        try:
            attempt = QuizAttempt.objects.get(id=pk, user=request.user)
        except:
            return Response({"error": "Invalid attempt"}, status=404)

        total = attempt.question_attempts.count()
        correct = attempt.question_attempts.filter(is_correct=True).count()
        score = round((correct / total) * 100, 2)

        attempt.score = score
        attempt.completed = True
        attempt.finished_at = timezone.now()
        attempt.save(update_fields=["score", "completed", "finished_at"])

        return Response({"score": score})


# ======================================================
# CATEGORY GROUP API
# ======================================================

class CategoryGroupListView(generics.ListAPIView):
    queryset = CategoryGroup.objects.prefetch_related("categories").all()
    serializer_class = CategoryGroupSerializer
