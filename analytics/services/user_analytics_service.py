from django.db.models import Avg, Max
from django.utils import timezone

from quiz.models import QuizAttempt, QuestionAttempt



class UserAnalyticsService:

    @staticmethod
    def get_dashboard(user):
        attempts = QuizAttempt.objects.filter(
            user=user
        ).order_by("-started_at")

        completed = attempts.filter(completed=True)

        latest = completed.first()
        best = completed.order_by("-score").first()

        return {
            "total_quizzes": completed.count(),
            "latest_score": latest.score if latest else 0,
            "best_score": best.score if best else 0,
            "average_score": round(
                completed.aggregate(avg=Avg("score"))["avg"] or 0,
                2,
            ),
            "recent_attempts": [
                {
                    "attempt_id": str(a.id),
                    "quiz_title": a.quiz.title,
                    "date": (
                        a.finished_at or a.started_at
                    ).isoformat(),
                    "score": a.score if a.completed else 0,
                    "completed": a.completed,
                    "status": (
                        "Completed"
                        if a.completed
                        else "In Progress"
                    ),
                }
                for a in attempts[:5]
            ],
        }

    @staticmethod
    def get_progress(user):
        attempts = QuizAttempt.objects.filter(
            user=user,
            completed=True,
        ).order_by("started_at")

        return [
            {
                "date": a.started_at.strftime("%Y-%m-%d"),
                "score": a.score,
            }
            for a in attempts
        ]

    @staticmethod
    def get_analytics(user):
        completed_attempts = QuizAttempt.objects.filter(
            user=user,
            completed=True,
        )

        # TIME TAKEN
        time_taken_list = []

        for attempt in completed_attempts:
            if attempt.started_at and attempt.finished_at:
                seconds = (
                    attempt.finished_at - attempt.started_at
                ).total_seconds()

                if seconds > 0:
                    time_taken_list.append(seconds)

        avg_time_per_quiz = (
            round(sum(time_taken_list) / len(time_taken_list), 2)
            if time_taken_list
            else 0
        )

        # QUESTION ANALYTICS
        question_attempts = QuestionAttempt.objects.filter(
            quiz_attempt__in=completed_attempts
        )

        difficulty_accuracy = {}

        for level in ["easy", "medium", "hard"]:
            total = question_attempts.filter(
                question__difficulty=level
            ).count()

            correct = question_attempts.filter(
                question__difficulty=level,
                is_correct=True,
            ).count()

            difficulty_accuracy[level] = (
                round((correct / total) * 100, 2)
                if total
                else 0
            )

        return {
            "total_quizzes": completed_attempts.count(),
            "average_score": round(
                completed_attempts.aggregate(avg=Avg("score"))["avg"] or 0,
                2,
            ),
            "best_score": completed_attempts.aggregate(
                Max("score")
            )["score__max"] or 0,
            "difficulty_accuracy": difficulty_accuracy,
            "avg_time_per_quiz": avg_time_per_quiz,
        }

    @staticmethod
    def get_recommended_difficulty(user):
        recent = QuizAttempt.objects.filter(
            user=user,
            completed=True,
        ).order_by("-finished_at")[:5]

        if not recent.exists():
            return {"difficulty": "easy"}

        avg = recent.aggregate(avg=Avg("score"))["avg"] or 0

        if avg >= 75:
            return {"difficulty": "hard"}
        if avg >= 40:
            return {"difficulty": "medium"}
        return {"difficulty": "easy"}
