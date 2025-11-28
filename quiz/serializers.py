from rest_framework import serializers
from .models import Category, Subcategory, Quiz, QuestionTemplate, QuizAttempt, QuestionAttempt


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = ["id", "name", "category"]


class QuestionTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionTemplate
        fields = ["id", "question", "choices", "correct_index", "explanation"]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionTemplateSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ["id", "category", "subcategory", "difficulty", "questions"]


class QuestionAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAttempt
        fields = ["id", "question", "selected_index", "is_correct"]


class QuizAttemptSerializer(serializers.ModelSerializer):
    questions = QuestionAttemptSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ["id", "quiz", "score", "questions"]
