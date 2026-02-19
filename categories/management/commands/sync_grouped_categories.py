from django.core.management.base import BaseCommand
from categories.models import Category as NewCategory
from quiz.models import Category as OldCategory

class Command(BaseCommand):
    help = "Sync new grouped categories into old quiz category table"

    def handle(self, *args, **kwargs):
        count = 0
        for cat in NewCategory.objects.all():
            obj, created = OldCategory.objects.get_or_create(
                name=cat.name
            )
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Synced {count} categories into quiz.Category"
        ))
