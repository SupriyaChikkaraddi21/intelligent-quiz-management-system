from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .models import UserProfile, UserReward

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_related_objects(sender, instance, created, **kwargs):
    """
    Automatically create UserProfile and UserReward
    when a new user is created.
    """

    if created:
        # Create profile safely
        UserProfile.objects.get_or_create(user=instance)

        # Create reward profile safely
        UserReward.objects.get_or_create(user=instance)
