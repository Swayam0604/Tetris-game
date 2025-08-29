#  users/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    total_score = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0)
    highest_score = models.IntegerField(default=0)
    

    exp = models.IntegerField(default=0)  # Experience points
    player_level=models.IntegerField(default=1)     # start from level 1
    player_name=models.CharField(max_length=50,unique=True)

    def __str__(self):
        return self.username
    

    def add_experience(self, points):
        """ ADD EXP AND HANDLE LEVELING UP """
        self.exp += points
        #  EXAMPLE FORMULA  : 100 EXP PER LEVEL 
        while self.exp >= self.player_level *  100:
            self.exp -= self.player_level * 100 
            self.player_level += 1
        self.save()