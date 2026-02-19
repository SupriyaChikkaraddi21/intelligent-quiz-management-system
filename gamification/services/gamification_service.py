from django.utils import timezone
from django.db.models import Avg
from datetime import timedelta

from quiz.models import QuizAttempt

from accounts.models import UserReward


class GamificationService:

    @staticmethod
    def get_user_status(user):
        attempts = QuizAttempt.objects.filter(
            user=user,
            completed=True,
            finished_at__isnull=False
        ).order_by("finished_at")

        total_completed = attempts.count()

        # ---------- LEVEL ----------
        if total_completed >= 30:
            level, next_level, remaining = "Legend", None, 0
        elif total_completed >= 15:
            level, next_level, remaining = "Pro", "Legend", 30 - total_completed
        elif total_completed >= 5:
            level, next_level, remaining = "Intermediate", "Pro", 15 - total_completed
        else:
            level, next_level, remaining = "Beginner", "Intermediate", 5 - total_completed

        # ---------- STREAK ----------
        dates = {a.finished_at.date() for a in attempts}
        streak = 0
        today = timezone.now().date()

        while today in dates:
            streak += 1
            today -= timedelta(days=1)

        # ---------- BADGES ----------
        badges = []

        if total_completed >= 1:
            badges.append("First Win")

        avg_score = attempts.aggregate(avg=Avg("score"))["avg"] or 0

        if avg_score >= 80:
            badges.append("Accuracy Star")

        if streak >= 7:
            badges.append("Streak Master")

        # ---------- REWARDS ----------
        reward, _ = UserReward.objects.get_or_create(user=user)

        today_date = timezone.now().date()

        if reward.last_reward_date != today_date and streak > 0:
            reward.points += 10
            reward.last_reward_date = today_date
            reward.save()

        return {
            "level": level,
            "next_level": next_level,
            "remaining_for_next": remaining,
            "total_completed": total_completed,
            "current_streak": streak,
            "badges": badges,
            "points": reward.points,
        }
