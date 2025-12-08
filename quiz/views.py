# quiz/views.py

from rest_framework import viewsets, mixins, generics
from rest_framework.decorators import action
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
            difficulty = request.data.get("difficulty", "medium").lower()
            count = int(request.data.get("count", 5))

            category = Category.objects.get(id=category_id)
            subcat = Subcategory.objects.get(id=subcategory_id) if subcategory_id else None

            topic = subcat.name if subcat else category.name

            origin_hint = ""
            if topic.lower() in ["national", "indian gk", "current affairs", "general knowledge"]:
                origin_hint = (
                    "Generate only India-specific questions. "
                    "Do NOT generate US-related questions."
                )

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
            current_difficulty="easy",
        )

        for qid in quiz.question_templates:
            try:
                qt = QuestionTemplate.objects.get(id=qid)
                QuestionAttempt.objects.create(
                    quiz_attempt=attempt,
                    question=qt,
                    selected_choice=-1,
                    is_correct=False,
                    difficulty=attempt.current_difficulty,
                )
            except QuestionTemplate.DoesNotExist:
                continue

        return Response({"attempt": QuizAttemptSerializer(attempt).data}, status=201)

    # ---------------------- GLOBAL ANALYTICS SUMMARY ----------------------
    @action(detail=False, methods=["get"])
    def analytics_summary(self, request):
        user = request.user

        attempts = QuizAttempt.objects.filter(user=user)
        qas = QuestionAttempt.objects.filter(quiz_attempt__in=attempts)

        total_questions = qas.count()
        correct = qas.filter(is_correct=True).count()
        incorrect = total_questions - correct

        # Difficulty stats
        difficulty_stats = {
            "easy": {"correct": 0, "incorrect": 0},
            "medium": {"correct": 0, "incorrect": 0},
            "hard": {"correct": 0, "incorrect": 0},
        }

        for qa in qas:
            diff = qa.difficulty or "easy"
            bucket = difficulty_stats.get(diff, difficulty_stats["easy"])

            if qa.is_correct:
                bucket["correct"] += 1
            else:
                bucket["incorrect"] += 1

        # Accuracy per difficulty
        for diff, stat in difficulty_stats.items():
            t = stat["correct"] + stat["incorrect"]
            stat["accuracy"] = round((stat["correct"] / t) * 100, 2) if t else 0

        # Strengths & Weak areas detection
        strengths, weaknesses = [], []

        for diff, stat in difficulty_stats.items():
            t = stat["correct"] + stat["incorrect"]
            if t < 3:
                continue

            if stat["accuracy"] >= 80:
                strengths.append(f"Great accuracy in {diff} level questions")
            if stat["accuracy"] <= 50:
                weaknesses.append(f"Low performance in {diff} level questions")

        if not strengths:
            strengths = ["No strong areas identified yet"]

        if not weaknesses:
            weaknesses = ["No major weak areas"]

        return Response({
            "total_questions": total_questions,
            "correct": correct,
            "incorrect": incorrect,
            "accuracy": round((correct / total_questions) * 100, 2) if total_questions else 0,
            "difficulty_breakdown": difficulty_stats,
            "strengths": strengths,
            "weak_areas": weaknesses,
        })


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
        difficulty_track = []

        for qa in attempt.question_attempts.all().order_by("id"):
            questions.append({
                "question_id": str(qa.question.id),
                "question_text": qa.question.question_text,
                "choices": qa.question.choices,
                "selected": qa.selected_choice,
                "correct_choice": qa.question.correct_choice,
                "explanation": qa.question.explanation or "",
                "difficulty": qa.difficulty,
            })
            difficulty_track.append(qa.difficulty or "easy")

        return Response({
            "attempt_id": str(attempt.id),
            "quiz_title": attempt.quiz.title,
            "questions": questions,
            "difficulty_progression": difficulty_track,
            "score": attempt.score,
            "completed": attempt.completed,
            "time_limit": attempt.quiz.time_limit,
            "started_at": attempt.started_at.isoformat(),
            "current_difficulty": attempt.current_difficulty,
        })

    # ---------------------- ANSWER + ADAPTIVE DIFFICULTY ----------------------
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

        choices = qa.question.choices
        if isinstance(choices, str):
            try:
                choices = json.loads(choices)
            except:
                choices = []
        if not isinstance(choices, list):
            choices = list(choices)

        raw_correct = qa.question.correct_choice
        try:
            correct_index = int(raw_correct)
        except:
            correct_index = (
                choices.index(raw_correct) if raw_correct in choices else -1
            )

        is_correct = False
        if 0 <= selected < len(choices):
            is_correct = (selected == correct_index)
        elif 1 <= selected <= len(choices):
            is_correct = ((selected - 1) == correct_index)

        qa.selected_choice = selected
        qa.is_correct = is_correct
        qa.save(update_fields=["selected_choice", "is_correct"])

        # ADAPTIVE ENGINE
        attempt = qa.quiz_attempt
        DIFF_ORDER = ["easy", "medium", "hard"]

        def increase(d): return DIFF_ORDER[min(DIFF_ORDER.index(d) + 1, 2)]
        def decrease(d): return DIFF_ORDER[max(DIFF_ORDER.index(d) - 1, 0)]

        recent = (
            QuestionAttempt.objects.filter(quiz_attempt=attempt)
            .order_by("-id")[:3]
        )

        correct_count = sum(1 for x in recent if x.is_correct)

        old = attempt.current_difficulty
        new = old

        if correct_count == 3:
            new = increase(old)
        elif correct_count <= 1:
            new = decrease(old)

        if new != old:
            attempt.current_difficulty = new
            attempt.save(update_fields=["current_difficulty"])

        return Response({
            "saved": True,
            "is_correct": is_correct,
            "new_difficulty": new,
        })

    # ---------------------- FINISH (WEIGHTED SCORING) ----------------------
    @action(detail=True, methods=["post"])
    def finish(self, request, pk=None):
        try:
            attempt = QuizAttempt.objects.get(id=pk, user=request.user)
        except QuizAttempt.DoesNotExist:
            return Response({"error": "Invalid attempt"}, status=404)

        weights = {"easy": 1, "medium": 2, "hard": 3}

        total_score = 0
        max_score = 0

        for qa in attempt.question_attempts.all():
            diff = qa.difficulty or "easy"
            weight = weights.get(diff, 1)

            max_score += weight
            if qa.is_correct:
                total_score += weight

        final_score = round((total_score / max_score) * 100, 2) if max_score else 0

        attempt.score = final_score
        attempt.completed = True
        attempt.finished_at = timezone.now()
        attempt.save(update_fields=["score", "completed", "finished_at"])

        return Response({"score": final_score})

    # ---------------------- ATTEMPT ANALYTICS ----------------------
    @action(detail=True, methods=["get"])
    def analytics(self, request, pk=None):
        try:
            attempt = QuizAttempt.objects.get(id=pk, user=request.user)
        except QuizAttempt.DoesNotExist:
            return Response({"error": "Attempt not found"}, status=404)

        qas = attempt.question_attempts.all()
        total = qas.count()
        correct = qas.filter(is_correct=True).count()
        incorrect = total - correct

        difficulty_stats = {
            "easy": {"correct": 0, "incorrect": 0},
            "medium": {"correct": 0, "incorrect": 0},
            "hard": {"correct": 0, "incorrect": 0},
        }

        for qa in qas:
            diff = qa.difficulty or "easy"
            if qa.is_correct:
                difficulty_stats[diff]["correct"] += 1
            else:
                difficulty_stats[diff]["incorrect"] += 1

        for diff, d in difficulty_stats.items():
            total_d = d["correct"] + d["incorrect"]
            d["accuracy"] = round((d["correct"] / total_d) * 100, 2) if total_d else 0

        weaknesses = []
        strengths = []

        for diff, stat in difficulty_stats.items():
            if stat["accuracy"] < 50 and (stat["correct"] + stat["incorrect"]) >= 2:
                weaknesses.append(f"Low accuracy in {diff} level questions")

        for diff, stat in difficulty_stats.items():
            if stat["accuracy"] >= 80 and (stat["correct"] + stat["incorrect"]) >= 2:
                strengths.append(f"Strong performance in {diff} level questions")

        if not weaknesses:
            weaknesses.append("No major weak areas detected")

        if not strengths:
            strengths.append("Good overall performance")

        return Response({
            "total_questions": total,
            "correct": correct,
            "incorrect": incorrect,
            "accuracy": round((correct / total) * 100, 2) if total else 0,
            "difficulty_breakdown": difficulty_stats,
            "weak_areas": weaknesses,
            "strengths": strengths,
        })


# ======================================================
# USER ANALYTICS (ALL ATTEMPTS)
# ======================================================

class UserAnalyticsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        attempts = QuizAttempt.objects.filter(user=user).order_by("started_at")

        if not attempts.exists():
            return Response({
                "total_quizzes": 0,
                "average_score": 0,
                "lifetime_accuracy": 0,
                "progress_graph": [],
                "difficulty_accuracy": {},
                "recommendations": ["Take your first quiz to build analytics."]
            })

        total_quizzes = attempts.count()
        average_score = round(attempts.aggregate(avg=models.Avg("score"))["avg"], 2)

        qas = QuestionAttempt.objects.filter(quiz_attempt__in=attempts)
        total_questions = qas.count()
        correct_answers = qas.filter(is_correct=True).count()

        lifetime_accuracy = (
            round((correct_answers / total_questions) * 100, 2)
            if total_questions else 0
        )

        progress_graph = [
            {"date": a.started_at.strftime("%Y-%m-%d"), "score": a.score}
            for a in attempts
        ]

        difficulty_groups = {"easy": [], "medium": [], "hard": []}

        for qa in qas:
            d = qa.difficulty or "easy"
            difficulty_groups[d].append(qa.is_correct)

        difficulty_accuracy = {}
        for d, values in difficulty_groups.items():
            if values:
                difficulty_accuracy[d] = round((sum(values) / len(values)) * 100, 2)
            else:
                difficulty_accuracy[d] = 0

        recommendations = []
        if difficulty_accuracy.get("medium", 0) < 50:
            recommendations.append("Improve medium-level fundamentals.")
        if difficulty_accuracy.get("hard", 0) < 40:
            recommendations.append("Work on core concepts before attempting hard questions.")
        if average_score < 50:
            recommendations.append("Review explanations more carefully.")

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
# CATEGORY GROUP API
# ======================================================

class CategoryGroupListView(generics.ListAPIView):
    queryset = CategoryGroup.objects.prefetch_related("categories").all()
    serializer_class = CategoryGroupSerializer
