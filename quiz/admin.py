from django.contrib import admin
from .models import Category, Subcategory, QuestionTemplate, Quiz, QuizAttempt

admin.site.register(Category)
admin.site.register(Subcategory)
admin.site.register(QuestionTemplate)
admin.site.register(Quiz)
admin.site.register(QuizAttempt)
