# quiz/repositories/attempt_repository.py

from accounts.models import UserReward


class AttemptRepository:

    @staticmethod
    def save_attempt(attempt, fields):
        attempt.save(update_fields=fields)

    @staticmethod
    def get_or_create_reward(user):
        reward, _ = UserReward.objects.get_or_create(user=user)
        return reward

    @staticmethod
    def save_reward(reward):
        reward.save()
