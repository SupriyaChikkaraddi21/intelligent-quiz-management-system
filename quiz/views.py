# from rest_framework import viewsets, mixins, generics
# from rest_framework.decorators import action, api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.authentication import TokenAuthentication
# from rest_framework.views import APIView

# from django.utils import timezone
# from django.db.models import Avg

# from .models import (
#     Category,
#     Subcategory,
#     QuestionTemplate,
#     Quiz,
#     QuizAttempt,
#     QuestionAttempt,
# )

# from .serializers import (
#     CategorySerializer,
#     SubcategorySerializer,
#     QuizAttemptSerializer,
#     CategoryGroupSerializer,
# )

# from .generate_quiz import generate_questions
# from categories.models import CategoryGroup


# # ======================================================
# # CATEGORY + SUBCATEGORY
# # ======================================================

# class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer


# class SubcategoryViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Subcategory.objects.all()
#     serializer_class = SubcategorySerializer


# # ======================================================
# # QUIZ VIEWSET
# # ======================================================

# class QuizViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
#     queryset = Quiz.objects.all()

#     # ✅ DASHBOARD
#     @action(detail=False, methods=["get"])
#     def dashboard(self, request):
#         attempts = QuizAttempt.objects.filter(user=request.user).order_by("-started_at")

#         return Response({
#             "total_quizzes": attempts.count(),
#             "average_score": round(attempts.aggregate(avg=Avg("score"))["avg"] or 0, 2),
#             "recent_scores": QuizAttemptSerializer(attempts[:5], many=True).data,
#         })

#     # ✅ PROGRESS
#     @action(detail=False, methods=["get"])
#     def progress(self, request):
#         attempts = QuizAttempt.objects.filter(
#             user=request.user,
#             completed=True
#         ).order_by("started_at")

#         return Response([
#             {"date": a.started_at.strftime("%Y-%m-%d"), "score": a.score}
#             for a in attempts
#         ])

#     # ✅ GENERATE QUIZ
#     @action(detail=False, methods=["post"])
#     def generate(self, request):
#         category = Category.objects.get(id=request.data.get("category"))
#         subcat_id = request.data.get("subcategory")
#         subcat = Subcategory.objects.get(id=subcat_id) if subcat_id else None

#         difficulty = request.data.get("difficulty", "medium")
#         count = int(request.data.get("count", 5))
#         topic = subcat.name if subcat else category.name

#         questions = generate_questions(topic, difficulty, count)

#         template_ids = []
#         for q in questions:
#             qt = QuestionTemplate.objects.create(
#                 category=category,
#                 subcategory=subcat,
#                 difficulty=difficulty,
#                 question_text=q["question"],
#                 choices=q["choices"],
#                 correct_choice=q["correct_choice_index"],
#                 explanation=q.get("explanation", ""),
#             )
#             template_ids.append(str(qt.id))

#         quiz = Quiz.objects.create(
#             title=f"{topic} Quiz",
#             category=category,
#             subcategory=subcat,
#             difficulty=difficulty,
#             question_templates=template_ids,
#             time_limit=count * 60,
#         )

#         return Response({"quiz_id": str(quiz.id)}, status=201)

#     # ✅ START QUIZ
#     @action(detail=True, methods=["post"])
#     def start(self, request, pk=None):
#         quiz = Quiz.objects.get(id=pk)

#         attempt = QuizAttempt.objects.create(
#             quiz=quiz,
#             user=request.user,
#             current_difficulty="easy",
#         )

#         for qid in quiz.question_templates:
#             qt = QuestionTemplate.objects.get(id=qid)
#             QuestionAttempt.objects.create(
#                 quiz_attempt=attempt,
#                 question=qt,
#                 selected_choice=-1,
#                 is_correct=False,
#                 difficulty="easy",
#             )

#         return Response({"attempt": QuizAttemptSerializer(attempt).data})


# # ======================================================
# # ATTEMPT VIEWSET
# # ======================================================

# class AttemptViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
#     queryset = QuizAttempt.objects.all()

#     @action(detail=True, methods=["get"])
#     def details(self, request, pk=None):
#         attempt = QuizAttempt.objects.get(id=pk, user=request.user)

#         return Response({
#             "attempt_id": str(attempt.id),
#             "quiz_title": attempt.quiz.title,
#             "questions": [
#                 {
#                     "question_id": str(qa.question.id),
#                     "question_text": qa.question.question_text,
#                     "choices": qa.question.choices,
#                     "selected": qa.selected_choice,
#                     "correct_choice": qa.question.correct_choice,
#                     "explanation": qa.question.explanation or "",
#                 }
#                 for qa in attempt.question_attempts.all().order_by("id")
#             ],
#             "score": attempt.score,
#             "completed": attempt.completed,
#             "time_limit": attempt.quiz.time_limit,
#             "started_at": attempt.started_at.isoformat(),
#         })

#     @action(detail=True, methods=["post"])
#     def answer(self, request, pk=None):
#         qa = QuestionAttempt.objects.get(
#             quiz_attempt_id=pk,
#             question_id=request.data["question_id"],
#         )

#         selected = int(request.data["selected"])
#         qa.selected_choice = selected
#         qa.is_correct = selected == qa.question.correct_choice
#         qa.save()

#         return Response({"saved": True})

#     @action(detail=True, methods=["post"])
#     def finish(self, request, pk=None):
#         attempt = QuizAttempt.objects.get(id=pk, user=request.user)

#         total = attempt.question_attempts.count()
#         correct = attempt.question_attempts.filter(is_correct=True).count()

#         attempt.score = round((correct / total) * 100, 2) if total else 0
#         attempt.completed = True
#         attempt.finished_at = timezone.now()
#         attempt.save()

#         return Response({"score": attempt.score})

#     @action(detail=True, methods=["get"])
#     def analytics(self, request, pk=None):
#         attempt = QuizAttempt.objects.get(id=pk, user=request.user)
#         qas = attempt.question_attempts.all()

#         total = qas.count()
#         correct = qas.filter(is_correct=True).count()

#         return Response({
#             "accuracy": round((correct / total) * 100, 2) if total else 0,
#             "difficulty_breakdown": {
#                 d: {
#                     "correct": qas.filter(difficulty=d, is_correct=True).count(),
#                     "incorrect": qas.filter(difficulty=d, is_correct=False).count(),
#                 }
#                 for d in ["easy", "medium", "hard"]
#             },
#             "strengths": ["Good progress"],
#             "weak_areas": ["Review incorrect answers"],
#         })


# # ======================================================
# # CATEGORY GROUPS
# # ======================================================

# class CategoryGroupListView(generics.ListAPIView):
#     queryset = CategoryGroup.objects.prefetch_related("categories")
#     serializer_class = CategoryGroupSerializer


# # ======================================================
# # LEADERBOARD (FIXED)
# # ======================================================

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def leaderboard_view(request):
#     leaderboard = (
#         QuizAttempt.objects
#         .filter(completed=True)
#         .values("user__username")
#         .annotate(avg_score=Avg("score"))
#         .order_by("-avg_score")
#     )

#     return Response([
#         {
#             "username": row["user__username"],
#             "avg_score": round(row["avg_score"], 2),
#         }
#         for row in leaderboard
#     ])
# from rest_framework.views import APIView
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.authentication import TokenAuthentication
# from rest_framework.response import Response
# from django.db.models import Avg

# from .models import QuizAttempt, QuestionAttempt


# class UserAnalyticsView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user

#         # Only completed attempts
#         attempts = QuizAttempt.objects.filter(
#             user=user,
#             completed=True
#         ).order_by("started_at")

#         total_quizzes = attempts.count()

#         average_score = round(
#             attempts.aggregate(avg=Avg("score"))["avg"] or 0,
#             2
#         )

#         # Progress graph
#         progress_graph = [
#             {
#                 "date": a.started_at.strftime("%Y-%m-%d"),
#                 "score": a.score,
#             }
#             for a in attempts
#         ]

#         # Question-level stats
#         qas = QuestionAttempt.objects.filter(
#             quiz_attempt__in=attempts
#         )

#         total_questions = qas.count()
#         correct_answers = qas.filter(is_correct=True).count()

#         lifetime_accuracy = (
#             round((correct_answers / total_questions) * 100, 2)
#             if total_questions else 0
#         )

#         # Difficulty accuracy
#         difficulty_accuracy = {
#             "easy": 0,
#             "medium": 0,
#             "hard": 0,
#         }

#         for diff in difficulty_accuracy.keys():
#             qs = qas.filter(difficulty=diff)
#             if qs.exists():
#                 difficulty_accuracy[diff] = round(
#                     (qs.filter(is_correct=True).count() / qs.count()) * 100,
#                     2
#                 )

#         # Recommendations
#         recommendations = []
#         if difficulty_accuracy["medium"] < 50:
#             recommendations.append("Improve medium-level fundamentals.")
#         if difficulty_accuracy["hard"] < 40:
#             recommendations.append("Practice basics before hard quizzes.")
#         if average_score < 50:
#             recommendations.append("Review incorrect answers carefully.")

#         if not recommendations:
#             recommendations.append("Excellent performance! Keep it up.")

#         return Response({
#             "total_quizzes": total_quizzes,
#             "average_score": average_score,
#             "lifetime_accuracy": lifetime_accuracy,
#             "progress_graph": progress_graph,
#             "difficulty_accuracy": difficulty_accuracy,
#             "recommendations": recommendations,
#         })
from rest_framework import viewsets, mixins, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from django.utils import timezone
from django.db.models import Avg

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

    # -------- GENERATE QUIZ --------
    @action(detail=False, methods=["post"])
    def generate(self, request):
        category = Category.objects.get(id=request.data["category"])
        subcat_id = request.data.get("subcategory")
        subcategory = Subcategory.objects.get(id=subcat_id) if subcat_id else None

        difficulty = request.data.get("difficulty", "medium")
        count = int(request.data.get("count", 5))
        topic = subcategory.name if subcategory else category.name

        questions = generate_questions(topic, difficulty, count)

        template_ids = []
        for q in questions:
            qt = QuestionTemplate.objects.create(
                category=category,
                subcategory=subcategory,
                difficulty=difficulty,
                question_text=q["question"],
                choices=q["choices"],
                correct_choice=q["correct_choice_index"],
                explanation=q.get("explanation", ""),
            )
            template_ids.append(str(qt.id))

        quiz = Quiz.objects.create(
            title=f"{topic} Quiz",
            category=category,
            subcategory=subcategory,
            difficulty=difficulty,
            question_templates=template_ids,
            time_limit=count * 60,
        )

        return Response({"quiz_id": str(quiz.id)}, status=201)

    # -------- START QUIZ --------
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

    # -------- ATTEMPT DETAILS --------
    @action(detail=True, methods=["get"])
    def details(self, request, pk=None):
        attempt = QuizAttempt.objects.get(id=pk, user=request.user)

        return Response({
            "attempt_id": str(attempt.id),
            "quiz_title": attempt.quiz.title,
            "questions": [
                {
                    "question_id": str(qa.question.id),
                    "question_text": qa.question.question_text,
                    "choices": qa.question.choices,
                    "selected": qa.selected_choice,
                    "correct_choice": qa.question.correct_choice,
                    "explanation": qa.question.explanation or "",
                }
                for qa in attempt.question_attempts.all().order_by("id")
            ],
            "score": attempt.score,
            "completed": attempt.completed,
            "time_limit": attempt.quiz.time_limit,
            "started_at": attempt.started_at.isoformat(),
        })

    # -------- SAVE ANSWER --------
    @action(detail=True, methods=["post"])
    def answer(self, request, pk=None):
        qa = QuestionAttempt.objects.get(
            quiz_attempt_id=pk,
            question_id=request.data["question_id"],
        )

        selected = int(request.data["selected"])
        qa.selected_choice = selected
        qa.is_correct = selected == qa.question.correct_choice
        qa.save()

        return Response({"saved": True})

    # -------- FINISH QUIZ --------
    @action(detail=True, methods=["post"])
    def finish(self, request, pk=None):
        attempt = QuizAttempt.objects.get(id=pk, user=request.user)

        total = attempt.question_attempts.count()
        correct = attempt.question_attempts.filter(is_correct=True).count()

        attempt.score = round((correct / total) * 100, 2) if total else 0
        attempt.completed = True
        attempt.finished_at = timezone.now()
        attempt.save()

        return Response({"score": attempt.score})

    # -------- ATTEMPT ANALYTICS --------
    @action(detail=True, methods=["get"])
    def analytics(self, request, pk=None):
        attempt = QuizAttempt.objects.get(id=pk, user=request.user)
        qas = attempt.question_attempts.all()

        total = qas.count()
        correct = qas.filter(is_correct=True).count()

        breakdown = {}
        for d in ["easy", "medium", "hard"]:
            qs = qas.filter(difficulty=d)
            breakdown[d] = {
                "correct": qs.filter(is_correct=True).count(),
                "incorrect": qs.filter(is_correct=False).count(),
                "accuracy": round(
                    (qs.filter(is_correct=True).count() / qs.count()) * 100, 2
                ) if qs.exists() else 0,
            }

        return Response({
            "accuracy": round((correct / total) * 100, 2) if total else 0,
            "difficulty_breakdown": breakdown,
            "strengths": ["Good progress"],
            "weak_areas": ["Review incorrect answers"],
        })


# ======================================================
# CATEGORY GROUPS
# ======================================================

class CategoryGroupListView(generics.ListAPIView):
    queryset = CategoryGroup.objects.prefetch_related("categories")
    serializer_class = CategoryGroupSerializer


# ======================================================
# USER DASHBOARD
# ======================================================

class UserDashboardView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attempts = QuizAttempt.objects.filter(user=request.user)

        return Response({
            "total_quizzes": attempts.count(),
            "average_score": round(attempts.aggregate(avg=Avg("score"))["avg"] or 0, 2),
            "recent_scores": QuizAttemptSerializer(attempts.order_by("-started_at")[:5], many=True).data,
        })


# ======================================================
# USER PROGRESS
# ======================================================

class UserProgressView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attempts = QuizAttempt.objects.filter(
            user=request.user,
            completed=True
        ).order_by("started_at")

        return Response([
            {"date": a.started_at.strftime("%Y-%m-%d"), "score": a.score}
            for a in attempts
        ])


# ======================================================
# USER ANALYTICS
# ======================================================

class UserAnalyticsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attempts = QuizAttempt.objects.filter(
            user=request.user,
            completed=True
        )

        qas = QuestionAttempt.objects.filter(quiz_attempt__in=attempts)

        total_q = qas.count()
        correct_q = qas.filter(is_correct=True).count()

        difficulty_accuracy = {}
        for d in ["easy", "medium", "hard"]:
            qs = qas.filter(difficulty=d)
            difficulty_accuracy[d] = round(
                (qs.filter(is_correct=True).count() / qs.count()) * 100, 2
            ) if qs.exists() else 0

        return Response({
            "total_quizzes": attempts.count(),
            "average_score": round(attempts.aggregate(avg=Avg("score"))["avg"] or 0, 2),
            "lifetime_accuracy": round((correct_q / total_q) * 100, 2) if total_q else 0,
            "progress_graph": [
                {"date": a.started_at.strftime("%Y-%m-%d"), "score": a.score}
                for a in attempts.order_by("started_at")
            ],
            "difficulty_accuracy": difficulty_accuracy,
            "recommendations": ["Keep practicing regularly"],
        })


# ======================================================
# LEADERBOARD
# ======================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard_view(request):
    leaderboard = (
        QuizAttempt.objects
        .filter(completed=True)
        .values("user__username")
        .annotate(avg_score=Avg("score"))
        .order_by("-avg_score")
    )

    return Response([
        {
            "username": row["user__username"],
            "avg_score": round(row["avg_score"], 2),
        }
        for row in leaderboard
    ])
