from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    total_score = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0)
    highest_score = models.IntegerField(default=0)
    player_level=models.IntegerField(default=0)
    player_name=models.CharField(max_length=50,unique=True)
    def __str__(self):
        return self.username