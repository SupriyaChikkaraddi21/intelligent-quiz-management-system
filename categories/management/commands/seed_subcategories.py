# categories/management/commands/seed_subcategories.py

from django.core.management.base import BaseCommand
from categories.models import Category
from quiz.models import Subcategory


# ============================================
# 🔥 ADD YOUR SUBCATEGORY MAP HERE (PASTE BELOW)
# ============================================

SUBCATEGORY_MAP = {
    "Python": [
        "Basics",
        "OOP in Python",
        "Advanced Python",
        "Modules & Libraries",
    ],
    "Java": [
        "Core Java",
        "OOP in Java",
        "Collections Framework",
        "Exception Handling",
    ],
    "Django": [
        "Django Models",
        "Django Views",
        "Django Templates",
        "Django REST Framework",
    ],
    "React": [
        "React Basics",
        "Hooks",
        "State Management",
        "React Router",
    ],
    "HTML": [
        "HTML Elements",
        "Forms & Attributes",
        "Semantic HTML",
    ],
    "Business Management": [
        "Business Strategy",
        "Marketing",
        "Finance Basics",
    ],
    "Computer Science": [
        "Operating Systems",
        "DBMS",
        "Networking",
    ],
    "General Knowledge": [
        "Indian GK",
        "World GK",
        "Important Dates",
    ],
    "Physics": [
        "Mechanics",
        "Optics",
        "Electromagnetism",
    ],
    "Quantitative Aptitude": [
        "Arithmetic",
        "Algebra",
        "Geometry",
        "Data Interpretation",
    ],
    "Sports": [
        "Cricket",
        "Football",
        "Olympics",
    ],
    "Chemistry": [
        "Organic Chemistry",
        "Inorganic Chemistry",
        "Physical Chemistry",
    ],
    "Current Affairs": [
        "National",
        "International",
        "Economy",
    ],
    "Logical Reasoning": [
        "Puzzles",
        "Blood Relations",
        "Series",
    ],
    "Movies & TV": [
        "Bollywood",
        "Hollywood",
        "Web Series",
    ],
    "Soft Skills": [
        "Leadership",
        "Teamwork",
        "Time Management",
    ],
    "Biology": [
        "Botany",
        "Zoology",
        "Human Body",
    ],
    "Communication Skills": [
        "Speaking",
        "Writing",
        "Listening",
    ],
    "Data Interpretation": [
        "Graphs",
        "Charts",
        "Tables",
    ],
    "English Grammar": [
        "Tenses",
        "Parts of Speech",
        "Sentence Correction",
    ],
    "Music": [
        "Instruments",
        "Artists",
        "Genres",
    ],
    "C Programming": [
        "Basics",
        "Pointers",
        "Memory Management",
    ],
    "Mathematics": [
        "Arithmetic",
        "Algebra",
        "Trigonometry",
        "Geometry",
    ],
    "Pop Culture": [
        "Celebrities",
        "Trends",
        "Memes",
    ],
    "Project Management": [
        "Agile",
        "Scrum",
        "Risk Management",
    ],
    "Verbal Ability": [
        "Vocabulary",
        "Synonyms & Antonyms",
        "Sentence Completion",
    ],
    "Data Structures & Algorithms": [
        "Arrays",
        "Trees",
        "Graphs",
        "Sorting",
    ],
    "History": [
        "Ancient History",
        "Medieval History",
        "Modern History",
    ],
    "Geography": [
        "World Geography",
        "Indian Geography",
        "Maps",
    ],
    "Web Development": [
        "Frontend Basics",
        "Backend Basics",
        "Full Stack Tools",
    ],
}


# ============================================
# COMMAND EXECUTION
# ============================================

class Command(BaseCommand):
    help = "Seeds subcategories for each category"

    def handle(self, *args, **kwargs):
        created_count = 0

        for category_name, subs in SUBCATEGORY_MAP.items():
            try:
                category = Category.objects.get(name=category_name)
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Category not found: {category_name}"))
                continue

            for sub_name in subs:
                obj, created = Subcategory.objects.get_or_create(
                    name=sub_name,
                    category=category,
                )
                if created:
                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Subcategory seeding complete — created {created_count} new subcategories.")
        )
