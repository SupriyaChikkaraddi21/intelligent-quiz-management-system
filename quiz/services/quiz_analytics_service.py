from django.shortcuts import get_object_or_404

from quiz.models import Quiz, QuizAttempt


class QuizAnalyticsService:

    @staticmethod
    def get_teacher_stats(user, quiz_id):
        """
        Returns teacher analytics for a specific quiz.
        """

        quiz = get_object_or_404(Quiz, id=quiz_id)

        # 🔒 Permission check
        if quiz.created_by != user:
            raise PermissionError("Not allowed")

        attempts = QuizAttempt.objects.filter(quiz=quiz)

        students_data = []

        for attempt in attempts:
            students_data.append({
                "attempt_id": str(attempt.id),
                "student_name": attempt.user.username,
                "score": attempt.score,
                "completed": attempt.completed,
                "quiz_mode": attempt.quiz_mode,
                "started_at": attempt.started_at,
                "finished_at": attempt.finished_at,
                "time_taken": attempt.time_taken,
                "total_points": attempt.total_points,
            })

        return {
            "title": quiz.title,
            "difficulty": quiz.difficulty,
            "total_attempts": attempts.count(),
            "students": students_data,
        }
