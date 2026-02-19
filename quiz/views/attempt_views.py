from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from ..models import QuizAttempt, QuestionAttempt, Quiz, QuestionTemplate
from accounts.models import UserReward
from ..services.attempt_service import AttemptService


class AttemptViewSet(
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    lookup_field = "id"
    lookup_url_kwarg = "id"

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = QuizAttempt.objects.all()

    # --------------------------------------------------
    # START QUIZ (NEW - MOVED FROM QuizViewSet)
    # --------------------------------------------------
    @action(detail=False, methods=["post"], url_path="start")
    def start(self, request):
        quiz_id = request.data.get("quiz_id")
        mode = request.data.get("mode", "practice")
        language = request.data.get("language", "en")

        if not quiz_id:
            return Response({"error": "quiz_id required"}, status=400)

        quiz = get_object_or_404(Quiz, id=quiz_id)

        existing = QuizAttempt.objects.filter(
            quiz=quiz,
            user=request.user,
            completed=False
        ).first()

        if existing:
            return Response({
                "attempt_id": str(existing.id),
                "message": "Resuming existing attempt"
            })

        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            user=request.user,
            quiz_mode=mode,
            language=language,
        )

        for template_id in quiz.question_templates:
            question = QuestionTemplate.objects.filter(id=template_id).first()
            if question:
                QuestionAttempt.objects.create(
                    quiz_attempt=attempt,
                    question=question
                )

        return Response({
            "attempt_id": str(attempt.id)
        })

    # --------------------------------------------------
    # RETRIEVE
    # --------------------------------------------------
    def retrieve(self, request, id=None):
        attempt = get_object_or_404(QuizAttempt, id=id)

        if attempt.user == request.user:
            return Response(self._build_attempt_response(attempt, request))

        if attempt.quiz.created_by == request.user:
            return Response(self._build_attempt_response(attempt, request))

        return Response({"error": "Not allowed"}, status=403)

    # --------------------------------------------------
    # COMMON RESPONSE BUILDER
    # --------------------------------------------------
    def _build_attempt_response(self, attempt, request):
        lang = attempt.language or "en"

        def content_for(q):
            return (
                q.content.get(lang)
                or q.content.get("en")
                or {}
            )

        reward = UserReward.objects.filter(user=request.user).first()

        hint_allowed = (
            attempt.quiz_mode == "practice"
            or (reward and reward.no_hints_unlocked)
            or request.session.get(f"hint_paid_{attempt.id}", False)
        )

        return {
            "attempt_id": str(attempt.id),
            "quiz_id": str(attempt.quiz.id),
            "quiz_title": attempt.quiz.title,
            "quiz_mode": attempt.quiz_mode,
            "started_at": attempt.started_at,
            "finished_at": attempt.finished_at,
            "time_taken": attempt.time_taken,
            "time_limit": attempt.quiz.time_limit,
            "score": attempt.score,
            "completed": attempt.completed,
            "language": attempt.language,
            "points": {
                "base": attempt.base_points,
                "accuracy_bonus": attempt.accuracy_bonus,
                "speed_bonus": attempt.speed_bonus,
                "total": attempt.total_points,
            } if attempt.quiz_mode == "challenge" else None,
            "questions": [
                {
                    "question_id": str(qa.question.id),
                    "question_text": content_for(qa.question).get("question", ""),
                    "question_type": qa.question.question_type,
                    "choices": content_for(qa.question).get("choices", []),
                    "correct_choice": content_for(qa.question).get("correct_choice"),
                    "correct_text": content_for(qa.question).get("correct_text"),
                    "is_correct": qa.is_correct,
                    "selected": qa.selected_choice,
                    "text_answer": qa.text_answer,
                    "hint": qa.question.hint if hint_allowed else "",
                    "explanation": qa.question.explanation,
                }
                for qa in attempt.question_attempts.all().order_by("id")
            ],
        }

    # --------------------------------------------------
    # DETAILS
    # --------------------------------------------------
    @action(detail=True, methods=["get"], url_path="details")
    def details(self, request, id=None):
        attempt = get_object_or_404(QuizAttempt, id=id)

        if attempt.user == request.user:
            return Response(self._build_attempt_response(attempt, request))

        if attempt.quiz.created_by == request.user:
            return Response(self._build_attempt_response(attempt, request))

        return Response({"error": "Not allowed"}, status=403)

    # --------------------------------------------------
    # ANSWER
    # --------------------------------------------------
    @action(detail=True, methods=["post"], url_path="answer")
    def answer(self, request, id=None):
        attempt = get_object_or_404(
            QuizAttempt,
            id=id,
            user=request.user,
        )

        qa = get_object_or_404(
            QuestionAttempt,
            quiz_attempt=attempt,
            question_id=request.data.get("question_id"),
        )

        lang = attempt.language or "en"
        content = (
            qa.question.content.get(lang)
            or qa.question.content.get("en")
            or {}
        )

        if "selected" in request.data:
            qa.selected_choice = request.data["selected"]
            qa.is_correct = (
                qa.selected_choice == content.get("correct_choice")
            )

        if "text_answer" in request.data:
            qa.text_answer = request.data["text_answer"]
            qa.is_correct = (
                qa.text_answer.strip().lower()
                == content.get("correct_text", "").strip().lower()
            )

        qa.save()
        return Response({"status": "saved"})

    # --------------------------------------------------
    # FINISH
    # --------------------------------------------------
    @action(detail=True, methods=["post"], url_path="finish")
    def finish(self, request, id=None):
        attempt = get_object_or_404(
            QuizAttempt,
            id=id,
            user=request.user,
        )

        result = AttemptService.finish_attempt(attempt)
        return Response(result)

    # --------------------------------------------------
    # USE HINT
    # --------------------------------------------------
    @action(detail=True, methods=["post"])
    def use_hint(self, request, id=None):
        attempt = get_object_or_404(
            QuizAttempt,
            id=id,
            user=request.user,
        )

        reward = UserReward.objects.filter(user=request.user).first()

        if not reward or reward.points < 2:
            return Response(
                {"error": "Not enough points to use hint"},
                status=400,
            )

        reward.points -= 2
        reward.save()

        request.session[f"hint_paid_{attempt.id}"] = True

        return Response({
            "success": True,
            "points": reward.points,
        })
