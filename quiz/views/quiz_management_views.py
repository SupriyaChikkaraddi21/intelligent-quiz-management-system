from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response

from accounts.permissions import IsUser

from ..models import Quiz, QuizAttempt, QuestionTemplate, QuestionAttempt
from ..serializers import QuizSerializer, UserQuizCreateSerializer


class QuizManagementViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    lookup_field = "id"
    lookup_url_kwarg = "pk"

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = QuizSerializer

    def get_queryset(self):
        return Quiz.objects.all()

    # --------------------------------------------------
    # UPDATE USER QUIZ
    # --------------------------------------------------
    def update(self, request, pk=None):
        quiz = get_object_or_404(
            Quiz,
            id=pk,
            created_by=request.user
        )

        data = request.data

        quiz.title = data.get("title", quiz.title)
        quiz.category_id = data.get("category")  # can be None now
        quiz.subcategory_id = data.get("subcategory")
        quiz.difficulty = data.get("difficulty", quiz.difficulty)

        QuestionTemplate.objects.filter(
            id__in=quiz.question_templates
        ).delete()

        new_template_ids = []

        for q in data.get("questions", []):
            qt = QuestionTemplate.objects.create(
                category=quiz.category,  # ✅ use object not raw id
                subcategory_id=quiz.subcategory_id,
                difficulty=q.get("difficulty", "medium"),
                source="user",
                question_type=q["question_type"],
                content={
                    "en": {
                        "question": q["question_text"],
                        "choices": q.get("choices", []),
                        "correct_choice": q.get("correct_choice"),
                        "correct_text": q.get("correct_text", ""),
                    }
                },
                hint=q.get("hint", ""),
                explanation=q.get("explanation", ""),
            )

            new_template_ids.append(str(qt.id))

        quiz.question_templates = new_template_ids
        quiz.time_limit = len(new_template_ids) * 60
        quiz.save()

        return Response({"quiz_id": str(quiz.id)})

    # --------------------------------------------------
    # CREATE USER QUIZ
    # --------------------------------------------------
    @action(
        detail=False,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsUser],
    )
    def create_user_quiz(self, request):
        serializer = UserQuizCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        quiz_type = "classroom" if request.data.get("classroom_id") else "personal"

        quiz = Quiz.objects.create(
            title=data["title"],
            category=data.get("category"),  # ✅ now optional
            subcategory_id=data.get("subcategory"),
            difficulty="medium",
            created_by=request.user,
            question_templates=[],
            quiz_type=quiz_type,
        )

        template_ids = []

        for q in data["questions"]:
            lang = q.get("language", "en")

            qt = QuestionTemplate.objects.create(
                category=data.get("category"),  # ✅ FIXED (was category_id)
                subcategory_id=data.get("subcategory"),
                difficulty=q.get("difficulty", "medium"),
                source="user",
                question_type=q["question_type"],
                content={
                    lang: {
                        "question": q["question_text"],
                        "choices": q.get("choices", []),
                        "correct_choice": q.get("correct_choice"),
                        "correct_text": q.get("correct_text", ""),
                    }
                },
                hint=q.get("hint", ""),
                explanation=q.get("explanation", ""),
            )

            template_ids.append(str(qt.id))

        quiz.question_templates = template_ids
        quiz.time_limit = len(template_ids) * 60
        quiz.save()

        return Response({"quiz_id": str(quiz.id)}, status=201)

    # --------------------------------------------------
    # MY QUIZZES
    # --------------------------------------------------
    @action(detail=False, methods=["get"])
    def my_quizzes(self, request):
        quizzes = Quiz.objects.filter(
            created_by=request.user,
            quiz_type="personal"
        ).order_by("-created_at")

        data = []

        for quiz in quizzes:
            attempt_count = QuizAttempt.objects.filter(
                quiz=quiz,
                user=request.user,
            ).count()

            data.append({
                "id": str(quiz.id),
                "title": quiz.title,
                "difficulty": quiz.difficulty,
                "attempts": attempt_count,
            })

        return Response(data)

    # --------------------------------------------------
    # TEACHER CLASSROOM QUIZZES
    # --------------------------------------------------
    @action(detail=False, methods=["get"])
    def classroom_quizzes(self, request):
        quizzes = Quiz.objects.filter(
            created_by=request.user,
            quiz_type="classroom"
        ).order_by("-created_at")

        data = []

        for quiz in quizzes:
            assignment_count = quiz.assignments.count()

            data.append({
                "id": str(quiz.id),
                "title": quiz.title,
                "difficulty": quiz.difficulty,
                "assigned_to": assignment_count,
            })

        return Response(data)
