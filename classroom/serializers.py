from classroom.models import QuizAssignment
from quiz.models import Quiz
from rest_framework import serializers


class QuizAssignmentSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    quiz_id = serializers.UUIDField(source="quiz.id", read_only=True)

    class Meta:
        model = QuizAssignment
        fields = [
            "id",
            "quiz_id",      # 🔥 ADD THIS
            "quiz_title",
            "classroom",
            "due_date",
            "is_active",
            "created_at",
        ]
