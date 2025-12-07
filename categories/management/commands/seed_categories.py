from django.core.management.base import BaseCommand
from django.utils.text import slugify

from categories.models import CategoryGroup, Category


SEED_DATA = [
    ("General & Knowledge", [
        "General Knowledge",
        "Current Affairs",
        "English Grammar",
        "Verbal Ability",
    ]),
    ("Aptitude & Reasoning", [
        "Quantitative Aptitude",
        "Logical Reasoning",
        "Data Interpretation",
    ]),
    ("Science & Academic Subjects", [
        "Physics",
        "Chemistry",
        "Biology",
        "Mathematics",
        "History",
        "Geography",
    ]),
    ("Technology & Programming", [
        "Computer Science",
        "Python",
        "Java",
        "C Programming",
        "Data Structures & Algorithms",
        "Web Development",
    ]),
    ("Business & Corporate Skills", [
        "Business Management",
        "Soft Skills",
        "Communication Skills",
        "Project Management",
    ]),
    ("Sports & Entertainment", [
        "Sports",
        "Movies & TV",
        "Music",
        "Pop Culture",
    ]),
]


class Command(BaseCommand):
    help = "Seed the database with category groups and categories (idempotent)."

    def handle(self, *args, **options):
        created_groups = 0
        created_categories = 0

        for group_order, (group_name, category_names) in enumerate(SEED_DATA, start=1):
            group_obj, g_created = CategoryGroup.objects.get_or_create(
                name=group_name,
                defaults={"order": group_order}
            )
            if not g_created:
                # ensure order is kept in case group existed without proper order
                if group_obj.order != group_order:
                    group_obj.order = group_order
                    group_obj.save(update_fields=["order"])
            else:
                created_groups += 1

            for cat_order, cat_name in enumerate(category_names, start=1):
                cat_slug = slugify(cat_name)
                cat_defaults = {
                    "order": cat_order,
                    "group": group_obj,
                }
                category_obj, c_created = Category.objects.get_or_create(
                    slug=cat_slug,
                    defaults={"name": cat_name, "order": cat_order, "group": group_obj}
                )
                # If slug matched an existing category but name/group/order differ, update safely
                if not c_created:
                    need_update = False
                    if category_obj.name != cat_name:
                        category_obj.name = cat_name
                        need_update = True
                    if category_obj.group_id != group_obj.id:
                        category_obj.group = group_obj
                        need_update = True
                    if category_obj.order != cat_order:
                        category_obj.order = cat_order
                        need_update = True
                    if need_update:
                        category_obj.save(update_fields=["name", "group", "order"])
                else:
                    created_categories += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seeding complete — created {created_groups} groups and {created_categories} categories (if not existing)."
        ))
