from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404

from ..models import Quiz, QuizAttempt, QuestionTemplate, QuestionAttempt
from .points import calculate_points
from ..repositories.attempt_repository import AttemptRepository


class AttemptService:

    # ==========================================================
    # START ATTEMPT
    # ==========================================================

    @staticmethod
    @transaction.atomic
    def start_attempt(user, quiz_id, quiz_mode="challenge"):
        quiz = get_object_or_404(Quiz, id=quiz_id)

        existing = QuizAttempt.objects.filter(
            quiz=quiz,
            user=user,
            completed=False
        ).first()

        if existing:
            return existing

        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            user=user,
            quiz_mode=quiz_mode,
            language=quiz.default_language,
            started_at=timezone.now(),
            completed=False,
        )

        # 🔥 IMPORTANT PART
        # Create QuestionAttempt entries

        question_ids = quiz.question_templates or []

        for qid in question_ids:
            try:
                question = QuestionTemplate.objects.get(id=qid)

                QuestionAttempt.objects.create(
                    quiz_attempt=attempt,
                    question=question,
                    difficulty=question.difficulty
                )

            except QuestionTemplate.DoesNotExist:
                continue

        return attempt

    # ==========================================================
    # FINISH ATTEMPT
    # ==========================================================

    @staticmethod
    @transaction.atomic
    def finish_attempt(attempt):
        if attempt.completed:
            return {
                "detail": "Attempt already finished",
                "score": attempt.score,
            }

        qas = attempt.question_attempts.all()
        total = qas.count()
        correct = sum(1 for qa in qas if qa.is_correct)

        attempt.score = round((correct / total) * 100, 2) if total else 0
        attempt.completed = True
        attempt.finished_at = timezone.now()

        attempt.time_taken = int(
            (attempt.finished_at - attempt.started_at).total_seconds()
        )

        AttemptRepository.save_attempt(
            attempt,
            ["score", "completed", "finished_at", "time_taken"],
        )

        points = calculate_points(attempt)

        attempt.base_points = points["base"]
        attempt.accuracy_bonus = points["accuracy_bonus"]
        attempt.speed_bonus = points["speed_bonus"]
        attempt.total_points = points["total"]

        AttemptRepository.save_attempt(
            attempt,
            ["base_points", "accuracy_bonus", "speed_bonus", "total_points"],
        )

        if attempt.quiz_mode == "challenge":
            reward = AttemptRepository.get_or_create_reward(attempt.user)
            reward.points += attempt.total_points
            AttemptRepository.save_reward(reward)

        return {
            "score": attempt.score,
            "completed": True,
        }
