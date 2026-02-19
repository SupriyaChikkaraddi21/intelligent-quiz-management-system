from rest_framework import serializers
from ..models import Category


class GenerateQuizSerializer(serializers.Serializer):
    topic = serializers.CharField(required=False, allow_blank=False)
    category = serializers.IntegerField(required=False)

    difficulty = serializers.ChoiceField(
        choices=["easy", "medium", "hard"],
        default="medium"
    )

    count = serializers.IntegerField(
        default=5,
        min_value=1,
        max_value=20
    )

    question_type = serializers.ChoiceField(
        choices=["mcq", "true_false", "type_answer"],
        default="mcq"
    )

    language = serializers.CharField(default="en")

    def validate(self, data):
        topic = data.get("topic")
        category = data.get("category")

        if not topic and not category:
            raise serializers.ValidationError(
                "Either topic or category is required."
            )

        if topic and category:
            raise serializers.ValidationError(
                "Provide either topic or category, not both."
            )

        if category and not Category.objects.filter(id=category).exists():
            raise serializers.ValidationError(
                "Invalid category ID."
            )

        return data
