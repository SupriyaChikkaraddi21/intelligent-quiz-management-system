from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response

from ..models import Quiz
from ..serializers import QuizSerializer
from ..serializers.generation_serializers import GenerateQuizSerializer
from ..services.quiz_generation_service import QuizGenerationService
from ..services.attempt_service import AttemptService


class QuizGenerationViewSet(viewsets.GenericViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = QuizSerializer
    queryset = Quiz.objects.all()

    # ---------------- GENERATE QUIZ ----------------
    @action(detail=False, methods=["post"])
    def generate(self, request):
        serializer = GenerateQuizSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data

        quiz = QuizGenerationService.generate_quiz(
            user=request.user,
            topic=validated.get("topic"),
            category_id=validated.get("category"),
            difficulty=validated.get("difficulty"),
            count=validated.get("count"),
            question_type=validated.get("question_type"),
            language=validated.get("language"),
        )

        return Response({"quiz_id": str(quiz.id)}, status=201)

    # ---------------- START QUIZ ----------------
    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        

        attempt = AttemptService.start_attempt(
            user=request.user,
            quiz_id=pk,
            quiz_mode=request.data.get("quiz_mode", "challenge"),
        )

        return Response({
            "attempt_id": str(attempt.id)
        }, status=201)
