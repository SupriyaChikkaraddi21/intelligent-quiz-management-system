from rest_framework import serializers
from .models import (
    Category,
    Subcategory,
    Quiz,
    QuestionTemplate,
    QuizAttempt,
    QuestionAttempt,
)

# ============================================================
# CATEGORY SERIALIZERS
# ============================================================

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = ["id", "name", "category"]


# ============================================================
# QUESTION TEMPLATE SERIALIZER
# ============================================================

class QuestionTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionTemplate
        fields = [
            "id",
            "question_text",
            "choices",
            "correct_choice",
            "explanation",
            "difficulty",
        ]


# ============================================================
# QUIZ SERIALIZER
# ============================================================

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionTemplateSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "category",
            "subcategory",
            "difficulty",
            "questions",
        ]


# ============================================================
# QUESTION ATTEMPT SERIALIZER (UPDATED)
# ============================================================

class QuestionAttemptSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text')
    choices = serializers.JSONField(source='question.choices')
    correct_choice = serializers.IntegerField(source='question.correct_choice')

    class Meta:
        model = QuestionAttempt
        fields = [
            "id",
            "question",
            "question_text",
            "choices",
            "correct_choice",
            "selected_choice",
            "is_correct",
            "difficulty",   # ⭐ NEW FIELD
        ]


# ============================================================
# QUIZ ATTEMPT SERIALIZER (UPDATED)
# ============================================================

class QuizAttemptSerializer(serializers.ModelSerializer):
    questions = QuestionAttemptSerializer(
        many=True,
        read_only=True,
        source="question_attempts"
    )

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "quiz",
            "score",
            "current_difficulty",   # ⭐ NEW FIELD
            "questions",
        ]


# ============================================================
# CATEGORY GROUP SERIALIZERS (UNCHANGED)
# ============================================================

from categories.models import CategoryGroup, Category as GroupCategory

class GroupCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupCategory
        fields = ("id", "name", "slug", "order")


class CategoryGroupSerializer(serializers.ModelSerializer):
    categories = GroupCategorySerializer(many=True, read_only=True)

    class Meta:
        model = CategoryGroup
        fields = ("id", "name", "order", "categories")
