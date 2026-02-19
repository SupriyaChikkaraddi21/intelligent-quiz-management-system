from django.db import migrations
from django.utils.text import slugify


def seed_full_structure(apps, schema_editor):
    CategoryGroup = apps.get_model("categories", "CategoryGroup")
    Category = apps.get_model("categories", "Category")
    Subcategory = apps.get_model("quiz", "Subcategory")

    data = {
        "General Knowledge": {
            "History": [
                "Ancient History",
                "Medieval History",
                "Modern History",
                "World History",
            ],
            "Geography": [
                "Physical Geography",
                "Indian Geography",
                "World Geography",
                "Environment & Ecology",
            ],
            "Indian Polity": [
                "Constitution",
                "Fundamental Rights",
                "Parliament & Governance",
            ],
            "Economics": [
                "Basic Economics",
                "Indian Economy",
                "Budget & Finance",
            ],
        },
        "Science": {
            "Physics": [
                "Motion & Laws",
                "Electricity",
                "Magnetism",
                "Optics",
            ],
            "Chemistry": [
                "Atomic Structure",
                "Chemical Reactions",
                "Organic Chemistry",
                "Periodic Table",
            ],
            "Biology": [
                "Human Body",
                "Plant Biology",
                "Genetics",
                "Ecology",
            ],
        },
        "Mathematics": {
            "Algebra": [
                "Linear Equations",
                "Quadratic Equations",
                "Polynomials",
            ],
            "Trigonometry": [
                "Trigonometric Ratios",
                "Identities",
                "Heights & Distances",
            ],
            "Calculus": [
                "Limits",
                "Derivatives",
                "Integration",
            ],
            "Probability & Statistics": [
                "Probability Basics",
                "Mean Median Mode",
                "Data Interpretation",
            ],
        },
        "Computer Science": {
            "Programming Fundamentals": [
                "Variables & Data Types",
                "Control Structures",
                "Functions",
            ],
            "Data Structures": [
                "Arrays",
                "Linked List",
                "Stack & Queue",
                "Trees",
            ],
            "Databases": [
                "SQL Basics",
                "Normalization",
                "Joins",
            ],
            "Operating Systems": [
                "Process Management",
                "Memory Management",
                "Scheduling",
            ],
        },
        "Aptitude": {
            "Quantitative Aptitude": [
                "Percentages",
                "Profit & Loss",
                "Time & Work",
                "Speed & Distance",
            ],
            "Logical Reasoning": [
                "Coding-Decoding",
                "Series",
                "Analogies",
            ],
            "Analytical Reasoning": [
                "Seating Arrangement",
                "Blood Relations",
                "Direction Sense",
            ],
        },
        "English": {
            "Grammar": [
                "Tenses",
                "Articles",
                "Prepositions",
            ],
            "Vocabulary": [
                "Synonyms",
                "Antonyms",
                "Idioms & Phrases",
            ],
            "Reading Skills": [
                "Comprehension",
                "Sentence Correction",
            ],
        },
        "Competitive Exams": {
            "GATE": [
                "Engineering Mathematics",
                "Computer Science",
            ],
            "Banking": [
                "Quant",
                "Reasoning",
                "English",
            ],
            "SSC": [
                "GK",
                "Aptitude",
                "English",
            ],
        },
        "Current Affairs": {
            "National": [
                "Government Schemes",
                "Politics",
            ],
            "International": [
                "Global Events",
                "Organizations",
            ],
            "Sports": [
                "Tournaments",
                "Awards",
            ],
        },
        "Web & Technology": {
            "Web Development": [
                "HTML",
                "CSS",
                "JavaScript",
            ],
            "Networking": [
                "OSI Model",
                "Protocols",
            ],
            "Cyber Security": [
                "Security Basics",
                "Threat Types",
            ],
        },
        "Brain Teasers": {
            "Puzzles": [
                "Logical Puzzles",
                "Pattern Puzzles",
            ],
            "Riddles": [
                "Easy Riddles",
                "Tricky Riddles",
            ],
            "Visual Reasoning": [
                "Pattern Recognition",
                "Odd One Out",
            ],
        },
    }

    for group_name, categories in data.items():
        group = CategoryGroup.objects.create(
            name=group_name
            )


        for category_name, subcategories in categories.items():
            category = Category.objects.create(
                name=category_name,
                slug=slugify(category_name),
                group=group,
            )

            for sub_name in subcategories:
                Subcategory.objects.create(
                    name=sub_name,
                    slug=slugify(f"{category_name}-{sub_name}"),
                    category=category,
                )


class Migration(migrations.Migration):

    dependencies = [
        ("categories", "0001_initial"),
        ("quiz", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_full_structure),
    ]
