from django.db import models
from django.utils.text import slugify
import uuid
from django.db.models import JSONField


class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Subcategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="subcategories")
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.category.name}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class QuestionTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    subcategory = models.ForeignKey(Subcategory, null=True, blank=True, on_delete=models.SET_NULL)
    difficulty = models.CharField(max_length=20, default="medium")
    source = models.CharField(max_length=50, default="ai")

    question_text = models.TextField()
    choices = JSONField(default=list)
    correct_choice = models.IntegerField()
    explanation = models.TextField(blank=True)
    references = JSONField(default=list)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question_text[:50]


class Quiz(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)

    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    subcategory = models.ForeignKey(Subcategory, null=True, blank=True, on_delete=models.SET_NULL)

    question_templates = JSONField(default=list)
    difficulty = models.CharField(max_length=20, default="medium")

    # ⭐ Dynamic timer stored in seconds
    time_limit = models.IntegerField(default=300)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class QuizAttempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)

    score = models.FloatField(default=0)
    completed = models.BooleanField(default=False)
    finished_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.quiz.title}"


class QuestionAttempt(models.Model):
    quiz_attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name="question_attempts")
    question = models.ForeignKey(QuestionTemplate, on_delete=models.CASCADE)

    selected_choice = models.IntegerField()
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.quiz_attempt} - {self.question.id}"
