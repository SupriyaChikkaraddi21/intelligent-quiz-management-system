from django.db import models
from django.conf import settings
from quiz.models import Quiz


# ============================================================
# QUIZ ASSIGNMENT (TEACHER → CLASSROOM)
# ============================================================

class QuizAssignment(models.Model):
    classroom = models.ForeignKey(
        "accounts.Classroom",
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assigned_quizzes"
    )

    due_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        db_table = "quiz_quizassignment"  # 🔥 VERY IMPORTANT (prevents new table creation)

    def __str__(self):
        return f"{self.quiz.title} → {self.classroom.name}"
