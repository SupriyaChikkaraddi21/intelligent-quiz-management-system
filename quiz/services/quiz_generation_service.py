# quiz/services/quiz_generation_service.py

from django.db import transaction

from ai.services.ai_service import AIService

from ..repositories.quiz_repository import QuizRepository
from ..repositories.category_repository import CategoryRepository


class QuizGenerationService:

    @staticmethod
    @transaction.atomic
    def generate_quiz(
        user,
        topic=None,
        category_id=None,
        difficulty="medium",
        count=5,
        question_type="mcq",
        language="en",
    ):
        # -------------------------------
        # Determine Topic Source
        # -------------------------------
        if topic:
            topic_name = topic.strip()
            category = None
        elif category_id:
            category = CategoryRepository.get_category_by_id(category_id)
            topic_name = category.name
        else:
            raise ValueError("Either topic or category is required")

        # -------------------------------
        # Generate Questions
        # -------------------------------
        questions = AIService.generate_questions(
            topic_name,
            difficulty,
            count,
            question_type=question_type,
            language=language,
        )

        if not questions:
            raise ValueError("AI failed to generate questions")

        template_ids = []

        for q in questions:
            qt = QuizRepository.create_question_template(
                category=category,
                difficulty=difficulty,
                source="ai",
                question_type=q.get("question_type", "mcq"),
                content={
                    language: {
                        "question": q.get("question", ""),
                        "choices": q.get("choices", []),
                        "correct_choice": q.get("correct_choice_index", 0),
                        "correct_text": q.get("correct_text", ""),
                    }
                },
                hint=q.get("hint", ""),
                explanation=q.get("explanation", ""),
            )

            template_ids.append(str(qt.id))

        quiz = QuizRepository.create_quiz(
            title=f"{topic_name} Quiz",
            category=category,
            difficulty=difficulty,
            question_templates=template_ids,
            time_limit=count * 60,
            created_by=user,
            quiz_type="ai",
        )

        return quiz
