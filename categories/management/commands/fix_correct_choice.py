from django.core.management.base import BaseCommand
from quiz.models import QuestionTemplate

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        fixed = 0
        for qt in QuestionTemplate.objects.all():
            try:
                if isinstance(qt.correct_choice, str):
                    qt.correct_choice = int(qt.correct_choice)
                    qt.save(update_fields=["correct_choice"])
                    fixed += 1
            except:
                continue

        self.stdout.write(self.style.SUCCESS(
            f"Fixed {fixed} question templates."
        ))
