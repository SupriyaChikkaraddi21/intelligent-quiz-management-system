from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

from django.db import models
from django.utils import timezone

from .models import (
    Category, Subcategory, QuestionTemplate,
    Quiz, QuizAttempt, QuestionAttempt
)

from .serializers import (
    CategorySerializer, SubcategorySerializer,
    QuizSerializer, QuizAttemptSerializer
)

from .generate_quiz import generate_questions


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

class QuizViewSet(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    # Dashboard -----------------------------------------------------
    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        user = request.user

        total = QuizAttempt.objects.filter(user=user).count()
        avg_score = QuizAttempt.objects.filter(user=user).aggregate(
            avg=models.Avg("score")
        )["avg"] or 0

        recent = QuizAttempt.objects.filter(user=user).order_by("-started_at")[:5]
        recent_data = QuizAttemptSerializer(recent, many=True).data

        return Response({
            "total_quizzes": total,
            "avg_score": avg_score,
            "recent_scores": recent_data
        })

    # Progress Graph ------------------------------------------------
    @action(detail=False, methods=["get"])
    def progress(self, request):
        attempts = QuizAttempt.objects.filter(user=request.user).order_by("started_at")
        return Response([
            {"date": a.started_at, "score": a.score}
            for a in attempts
        ])

    # Leaderboard ---------------------------------------------------
    @action(detail=False, methods=["get"])
    def leaderboard(self, request):
        users = (
            QuizAttempt.objects.values("user__username")
            .annotate(avg_score=models.Avg("score"))
            .order_by("-avg_score")
        )

        data = [
            {"username": u["user__username"], "avg_score": round(u["avg_score"] or 0, 2)}
            for u in users
        ]

        return Response(data)

    # Generate Quiz -------------------------------------------------
    @action(detail=False, methods=["post"])
    def generate(self, request):
        category_id = request.data.get("category")
        subcat_id = request.data.get("subcategory")
        difficulty = request.data.get("difficulty", "Medium")
        count = int(request.data.get("count", 5))

        try:
            category = Category.objects.get(id=category_id)
        except:
            return Response({"error": "Invalid category"}, status=400)

        subcat = None
        if subcat_id:
            try:
                subcat = Subcategory.objects.get(id=subcat_id)
            except:
                return Response({"error": "Invalid subcategory"}, status=400)

        topic = subcat.name if subcat else category.name

        # Generate questions from AI
        ai = generate_questions(topic, difficulty, count)
        if not ai:
            return Response({"error": "AI failed to generate questions"}, status=500)

        # Save QuestionTemplate
        ids = []
        for q in ai:
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
            ids.append(str(qt.id))

        # Create quiz
        quiz = Quiz.objects.create(
            title=f"{topic} Quiz",
            category=category,
            subcategory=subcat,
            difficulty=difficulty,
            question_templates=ids
        )

        return Response({"quiz_id": str(quiz.id)}, status=201)

    # Start attempt -------------------------------------------------
    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        try:
            quiz = Quiz.objects.get(id=pk)
        except:
            return Response({"error": "Invalid quiz"}, status=404)

        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            user=request.user
        )

        for qid in quiz.question_templates:
            qt = QuestionTemplate.objects.get(id=qid)
            QuestionAttempt.objects.create(
                quiz_attempt=attempt,
                question=qt,
                selected_choice=-1
            )

        return Response({"attempt": QuizAttemptSerializer(attempt).data}, status=201)


# ======================================================
# ATTEMPT VIEWSET
# ======================================================

class AttemptViewSet(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    # Attempt Details ----------------------------------------------
    @action(detail=True, methods=["get"])
    def details(self, request, pk=None):
        try:
            attempt = QuizAttempt.objects.get(id=pk, user=request.user)
        except:
            return Response({"error": "Attempt not found"}, status=404)

        questions = []
        for qa in attempt.question_attempts.all():
            questions.append({
                "question_id": str(qa.question.id),
                "question_text": qa.question.question_text,
                "choices": qa.question.choices,
                "selected": qa.selected_choice,
                "correct_choice": qa.question.correct_choice,
            })

        return Response({
            "attempt_id": str(attempt.id),
            "quiz_title": attempt.quiz.title,
            "questions": questions,
            "score": attempt.score,
            "completed": attempt.completed
        })

    # Save answer ---------------------------------------------------
    @action(detail=True, methods=["post"])
    def answer(self, request, pk=None):
        qid = request.data.get("question_id")
        selected = request.data.get("selected")

        try:
            qa = QuestionAttempt.objects.get(quiz_attempt_id=pk, question_id=qid)
        except:
            return Response({"error": "Invalid question"}, status=404)

        qa.selected_choice = selected
        qa.is_correct = (selected == qa.question.correct_choice)
        qa.save()

        return Response({"saved": True})

    # Finish attempt ------------------------------------------------
    @action(detail=True, methods=["post"])
    def finish(self, request, pk=None):
        try:
            attempt = QuizAttempt.objects.get(id=pk, user=request.user)
        except:
            return Response({"error": "Invalid attempt"}, status=404)

        total = attempt.question_attempts.count()
        correct = attempt.question_attempts.filter(is_correct=True).count()
        score = round((correct / total) * 100, 2) if total > 0 else 0

        attempt.score = score
        attempt.completed = True
        attempt.finished_at = timezone.now()
        attempt.save()

        return Response({"score": score})
