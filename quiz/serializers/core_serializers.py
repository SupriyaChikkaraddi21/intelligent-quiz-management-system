from rest_framework import serializers
from ..models import (
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
# (MULTI-LANGUAGE SAFE + BACKWARD COMPATIBLE)
# ============================================================

class QuestionTemplateSerializer(serializers.ModelSerializer):
    question_text = serializers.SerializerMethodField()
    choices = serializers.SerializerMethodField()
    correct_choice = serializers.SerializerMethodField()
    correct_text = serializers.SerializerMethodField()

    class Meta:
        model = QuestionTemplate
        fields = [
            "id",
            "question_text",
            "question_type",
            "choices",
            "correct_choice",
            "correct_text",
            "hint",
            "explanation",
            "difficulty",
        ]

    def _get_language(self):
        request = self.context.get("request")
        return request.query_params.get("lang", "en") if request else "en"

    def _get_content(self, obj):
        return obj.get_content(self._get_language())

    def get_question_text(self, obj):
        return self._get_content(obj).get("question", "")

    def get_choices(self, obj):
        return self._get_content(obj).get("choices", [])

    def get_correct_choice(self, obj):
        return self._get_content(obj).get("correct_choice", None)

    def get_correct_text(self, obj):
        return self._get_content(obj).get("correct_text", "")


# ============================================================
# QUIZ SERIALIZER (IMPROVED FOR DASHBOARD)
# ============================================================

class QuizSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "category",
            "subcategory",
            "difficulty",
            "supported_languages",
            "default_language",
            "created_by",
        ]

    def get_created_by(self, obj):
        return obj.created_by.username if obj.created_by else None


# ============================================================
# QUESTION ATTEMPT SERIALIZER
# ============================================================

class QuestionAttemptSerializer(serializers.ModelSerializer):
    question_text = serializers.SerializerMethodField()
    question_type = serializers.CharField(
        source="question.question_type",
        read_only=True
    )
    choices = serializers.SerializerMethodField()
    correct_choice = serializers.SerializerMethodField()
    correct_text = serializers.SerializerMethodField()

    hint = serializers.CharField(
        source="question.hint",
        read_only=True
    )

    class Meta:
        model = QuestionAttempt
        fields = [
            "id",
            "question",
            "question_text",
            "question_type",
            "choices",
            "correct_choice",
            "correct_text",
            "hint",
            "selected_choice",
            "text_answer",
            "is_correct",
            "difficulty",
            "time_spent",
        ]

    def _get_language(self):
        request = self.context.get("request")
        return request.query_params.get("lang", "en") if request else "en"

    def _get_content(self, obj):
        return obj.question.get_content(self._get_language())

    def get_question_text(self, obj):
        return self._get_content(obj).get("question", "")

    def get_choices(self, obj):
        return self._get_content(obj).get("choices", [])

    def get_correct_choice(self, obj):
        return self._get_content(obj).get("correct_choice", None)

    def get_correct_text(self, obj):
        return self._get_content(obj).get("correct_text", "")


# ============================================================
# QUIZ ATTEMPT SERIALIZER
# ============================================================

class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(
        source="quiz.title",
        read_only=True
    )

    quiz_id = serializers.UUIDField(
        source="quiz.id",
        read_only=True
    )

    started_at = serializers.DateTimeField(read_only=True)
    quiz_mode = serializers.CharField(read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "quiz_id",
            "quiz_title",
            "quiz_mode",
            "score",
            "completed",
            "started_at",
            "language",
        ]


# ============================================================
# CATEGORY GROUP SERIALIZERS
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


# ============================================================
# LEADERBOARD SERIALIZER
# ============================================================

class LeaderboardSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    avg_score = serializers.FloatField()


# ============================================================
# USER-CREATED QUIZ SERIALIZERS
# ============================================================

class UserQuizQuestionCreateSerializer(serializers.Serializer):
    question_text = serializers.CharField()
    language = serializers.CharField(default="en")

    question_type = serializers.ChoiceField(
        choices=["mcq", "true_false", "type_answer"],
        default="mcq"
    )

    choices = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )

    correct_choice = serializers.IntegerField(
        required=False,
        allow_null=True
    )

    correct_text = serializers.CharField(
        required=False,
        allow_blank=True
    )

    hint = serializers.CharField(
        required=False,
        allow_blank=True
    )

    explanation = serializers.CharField(
        required=False,
        allow_blank=True
    )

    difficulty = serializers.ChoiceField(
        choices=["easy", "medium", "hard"],
        default="medium"
    )

    def validate(self, data):
        qtype = data.get("question_type")

        if qtype in ["mcq", "true_false"]:
            if not data.get("choices"):
                raise serializers.ValidationError(
                    "Choices are required for MCQ / True-False questions."
                )
            if data.get("correct_choice") is None:
                raise serializers.ValidationError(
                    "Correct choice index is required."
                )
            if data["correct_choice"] >= len(data["choices"]):
                raise serializers.ValidationError(
                    "Correct choice index is out of range."
                )

        if qtype == "type_answer" and not data.get("correct_text"):
            raise serializers.ValidationError(
                "Correct text answer is required for type-answer questions."
            )

        return data


class UserQuizCreateSerializer(serializers.Serializer):
    title = serializers.CharField()

    # 🔥 FIXED: make category optional and valid syntax
    category = serializers.IntegerField(
        required=False,
        allow_null=True
    )

    # 🔥 FIXED: correct syntax (you were missing parentheses)
    subcategory = serializers.IntegerField(
        required=False,
        allow_null=True
    )

    questions = UserQuizQuestionCreateSerializer(many=True)

    def validate_questions(self, value):
        if not value:
            raise serializers.ValidationError(
                "At least one question is required to create a quiz."
            )
        return value


