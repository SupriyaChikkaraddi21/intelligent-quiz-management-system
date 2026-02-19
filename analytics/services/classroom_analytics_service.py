from django.shortcuts import get_object_or_404
from django.db.models import Avg, Max, Min

from accounts.models import Classroom
from quiz.models import QuizAttempt


class ClassroomAnalyticsService:

    @staticmethod
    def get_classroom_analytics(user, classroom_id):
        classroom = get_object_or_404(Classroom, id=classroom_id)

        if classroom.teacher != user:
            raise PermissionError("Only the classroom teacher can view analytics")

        students = classroom.students.all()
        assignments = classroom.assignments.select_related("quiz")

        # ---------------- STUDENT PERFORMANCE ----------------
        student_data = []

        for student in students:
            attempts = QuizAttempt.objects.filter(
                user=student,
                quiz__assignments__classroom=classroom,  # ✅ FIXED
                completed=True
            )

            avg_score = attempts.aggregate(avg=Avg("score"))["avg"] or 0

            student_data.append({
                "student_id": student.id,
                "username": student.username,
                "attempts": attempts.count(),
                "average_score": round(avg_score, 2),
            })

        # ---------------- QUIZ PERFORMANCE ----------------
        quiz_data = []

        for assignment in assignments:
            quiz = assignment.quiz

            attempts = QuizAttempt.objects.filter(
                quiz=quiz,
                user__in=students,
                completed=True
            )

            quiz_data.append({
                "quiz_id": str(quiz.id),
                "title": quiz.title,
                "attempt_count": attempts.count(),
                "average_score": round(
                    attempts.aggregate(avg=Avg("score"))["avg"] or 0, 2
                ),
                "highest_score": attempts.aggregate(Max("score"))["score__max"] or 0,
                "lowest_score": attempts.aggregate(Min("score"))["score__min"] or 0,
            })

        return {
            "classroom_id": classroom.id,
            "classroom_name": classroom.name,
            "total_students": students.count(),
            "total_quizzes_assigned": assignments.count(),
            "student_performance": student_data,
            "quiz_performance": quiz_data,
        }
