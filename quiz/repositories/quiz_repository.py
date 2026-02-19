# quiz/repositories/quiz_repository.py

from quiz.models import Quiz, QuestionTemplate


class QuizRepository:

    @staticmethod
    def create_question_template(**data):
        return QuestionTemplate.objects.create(**data)

    @staticmethod
    def create_quiz(**data):
        return Quiz.objects.create(**data)
