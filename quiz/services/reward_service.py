from django.utils import timezone

from accounts.models import UserReward


class RewardService:

    REWARDS_CATALOG = {
        "HARD_MODE": {"cost": 100, "field": "hard_mode_unlocked"},
        "NO_HINTS": {"cost": 50, "field": "no_hints_unlocked"},
        "GOLD_BADGE": {"cost": 75, "field": "gold_badge_unlocked"},
    }

    @staticmethod
    def get_rewards(user):
        reward, _ = UserReward.objects.get_or_create(user=user)

        return {
            "points": reward.points,
            "rewards": [
                {
                    "code": code,
                    "label": label,
                    "cost": data["cost"],
                    "unlocked": getattr(reward, data["field"]),
                }
                for code, (label, data) in {
                    "HARD_MODE": ("Unlock Hard Difficulty", RewardService.REWARDS_CATALOG["HARD_MODE"]),
                    "NO_HINTS": ("Disable Hints", RewardService.REWARDS_CATALOG["NO_HINTS"]),
                    "GOLD_BADGE": ("Gold Profile Badge", RewardService.REWARDS_CATALOG["GOLD_BADGE"]),
                }.items()
            ],
        }

    @staticmethod
    def redeem_reward(user, code):
        reward, _ = UserReward.objects.get_or_create(user=user)

        if code not in RewardService.REWARDS_CATALOG:
            raise ValueError("Invalid reward code")

        reward_data = RewardService.REWARDS_CATALOG[code]
        cost = reward_data["cost"]
        field = reward_data["field"]

        if reward.points < cost:
            raise ValueError("Not enough points")

        if getattr(reward, field):
            raise ValueError("Reward already unlocked")

        reward.points -= cost
        setattr(reward, field, True)
        reward.last_reward_date = timezone.now().date()
        reward.save()

        return {
            "success": True,
            "points": reward.points,
        }
