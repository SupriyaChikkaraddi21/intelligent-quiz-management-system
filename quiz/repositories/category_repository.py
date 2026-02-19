# quiz/repositories/category_repository.py

from django.shortcuts import get_object_or_404
from quiz.models import Category


class CategoryRepository:

    @staticmethod
    def get_category_by_id(category_id):
        return get_object_or_404(Category, id=category_id)
