from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from quiz.models import QuizAttempt


class LeaderboardService:

    @staticmethod
    def _format_display_name(row):
        full_name = row.get("user__userprofile__full_name")
        username = row.get("user__username")

        # If full_name exists and not empty → use it
        if full_name and full_name.strip():
            return full_name

        # Otherwise fallback to username
        return username or "Unknown User"

    @staticmethod
    def _build_queryset(base_queryset):
        rows = (
            base_queryset
            .select_related("user", "user__userprofile")
            .values(
                "user__username",
                "user__userprofile__full_name",
            )
            .annotate(total_points=Sum("total_points"))
            .order_by("-total_points")
        )

        return [
            {
                "display_name": LeaderboardService._format_display_name(row),
                "total_points": row["total_points"] or 0,
            }
            for row in rows
        ]

    @staticmethod
    def global_leaderboard():
        base = QuizAttempt.objects.filter(
            completed=True,
            quiz_mode="challenge"
        )
        return LeaderboardService._build_queryset(base)

    @staticmethod
    def weekly_leaderboard():
        start_date = timezone.now() - timedelta(days=7)

        base = QuizAttempt.objects.filter(
            completed=True,
            quiz_mode="challenge",
            finished_at__gte=start_date
        )
        return LeaderboardService._build_queryset(base)

    @staticmethod
    def monthly_leaderboard():
        now = timezone.now()
        start_date = now.replace(day=1, hour=0, minute=0, second=0)

        base = QuizAttempt.objects.filter(
            completed=True,
            quiz_mode="challenge",
            finished_at__gte=start_date
        )
        return LeaderboardService._build_queryset(base)
