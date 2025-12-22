from django.contrib import admin
from .models import Subcategory, QuestionTemplate, Quiz, QuizAttempt,QuestionAttempt

# admin.site.register(Category)
admin.site.register(Subcategory)
admin.site.register(QuestionTemplate)
admin.site.register(Quiz)
admin.site.register(QuizAttempt)
admin.site.register(QuestionAttempt)