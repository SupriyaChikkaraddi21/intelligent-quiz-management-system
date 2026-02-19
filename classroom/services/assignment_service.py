from django.shortcuts import get_object_or_404

from classroom.models import QuizAssignment
from quiz.models import Quiz
from accounts.models import Classroom


class AssignmentService:

    @staticmethod
    def assign_quiz(user, classroom_id, quiz_id):
        if not classroom_id or not quiz_id:
            raise ValueError("classroom_id and quiz_id required")

        classroom = get_object_or_404(Classroom, id=classroom_id)
        quiz = get_object_or_404(Quiz, id=quiz_id)

        if classroom.teacher != user:
            raise PermissionError("Only classroom teacher can assign")

        QuizAssignment.objects.create(
            classroom=classroom,
            quiz=quiz,
            assigned_by=user
        )

        return {"message": "Quiz assigned successfully"}
