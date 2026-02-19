from django.db import models
from django.utils.text import slugify
import uuid
from django.db.models import JSONField
from categories.models import Category
from django.conf import settings


# ============================================================
# SUBCATEGORY
# ============================================================

class Subcategory(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="subcategories"
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.category.slug}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} → {self.name}"


# ============================================================
# QUESTION TEMPLATE (MULTI-LANGUAGE SAFE)
# ============================================================

class QuestionTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 🔥 FIXED → ALLOW NULL FOR AI TOPIC-BASED QUIZZES
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    subcategory = models.ForeignKey(
        Subcategory,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    difficulty = models.CharField(max_length=20, default="medium")
    source = models.CharField(max_length=50, default="ai")

    QUESTION_TYPE_CHOICES = (
        ("mcq", "MCQ"),
        ("true_false", "True / False"),
        ("type_answer", "Type Answer"),
    )

    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPE_CHOICES,
        default="mcq"
    )

    content = JSONField(default=dict)

    hint = models.TextField(
        blank=True,
        default="",
        help_text="Optional hint (shown only in practice mode)"
    )

    explanation = models.TextField(blank=True)
    references = JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def get_content(self, language="en"):
        if language in self.content:
            return self.content[language]
        return self.content.get("en", {})

    def __str__(self):
        return f"{self.id} ({self.difficulty})"


# ============================================================
# QUIZ
# ============================================================

class Quiz(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)

    # 🔥 FIXED → ALLOW NULL FOR AI TOPIC-BASED QUIZZES
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    subcategory = models.ForeignKey(
        Subcategory,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    question_templates = JSONField(default=list)

    difficulty = models.CharField(max_length=20, default="medium")
    time_limit = models.IntegerField(default=300)

    supported_languages = JSONField(default=list)
    default_language = models.CharField(max_length=10, default="en")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_quizzes"
    )

    QUIZ_TYPE_CHOICES = (
        ("personal", "Personal"),
        ("classroom", "Classroom"),
        ("ai", "AI Generated"),
    )

    quiz_type = models.CharField(
        max_length=20,
        choices=QUIZ_TYPE_CHOICES,
        default="ai"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ============================================================
# QUIZ ATTEMPT
# ============================================================

DIFFICULTY_CHOICES = (
    ("easy", "Easy"),
    ("medium", "Medium"),
    ("hard", "Hard"),
)

QUIZ_MODE_CHOICES = (
    ("practice", "Practice"),
    ("challenge", "Challenge"),
)


class QuizAttempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    quiz_mode = models.CharField(
        max_length=20,
        choices=QUIZ_MODE_CHOICES,
        default="challenge"
    )

    language = models.CharField(max_length=10, default="en")

    score = models.FloatField(default=0)
    completed = models.BooleanField(default=False)

    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    time_taken = models.IntegerField(default=0)

    base_points = models.IntegerField(default=0)
    accuracy_bonus = models.IntegerField(default=0)
    speed_bonus = models.IntegerField(default=0)
    total_points = models.IntegerField(default=0)

    current_difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        default="easy"
    )

    def __str__(self):
        return f"{self.user} | {self.quiz.title} | {self.quiz_mode}"


# ============================================================
# QUESTION ATTEMPT
# ============================================================

class QuestionAttempt(models.Model):
    quiz_attempt = models.ForeignKey(
        QuizAttempt,
        on_delete=models.CASCADE,
        related_name="question_attempts"
    )

    question = models.ForeignKey(QuestionTemplate, on_delete=models.CASCADE)

    selected_choice = models.IntegerField(default=-1)
    text_answer = models.TextField(blank=True, default="")
    is_correct = models.BooleanField(default=False)

    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        null=True,
        blank=True
    )

    time_spent = models.IntegerField(default=0)
    hint_used = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.quiz_attempt.id} → {self.question.id}"


