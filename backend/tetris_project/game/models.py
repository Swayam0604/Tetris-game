# models.py - Enhanced game tracking models

from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
import json

User = get_user_model()

class GameSession(models.Model):
    """Complete game session with detailed tracking"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Basic game info
    score = models.IntegerField(default=0)
    final_level = models.IntegerField(default=1)
    lines_cleared = models.IntegerField(default=0)
    
    # Timing information
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    
    # Detailed game stats
    pieces_placed = models.IntegerField(default=0)
    tetrises_cleared = models.IntegerField(default=0)  # 4-line clears
    t_spins = models.IntegerField(default=0)
    max_combo = models.IntegerField(default=0)
    
    # Game ending
    GAME_END_REASONS = [
        ('top_out', 'Topped Out'),
        ('quit', 'Player Quit'),
        ('completed', 'Completed'),
    ]
    end_reason = models.CharField(max_length=20, choices=GAME_END_REASONS, default='top_out')
    
    # Additional data (JSON field for flexibility)
    game_data = models.JSONField(default=dict, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-score']),
            models.Index(fields=['-score']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.score} points - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate duration if ended_at is set
        if self.ended_at and self.started_at:
            duration = self.ended_at - self.started_at
            self.duration_seconds = int(duration.total_seconds())
        super().save(*args, **kwargs)
    
    @property
    def duration_formatted(self):
        """Return duration in MM:SS format"""
        if self.duration_seconds:
            minutes = self.duration_seconds // 60
            seconds = self.duration_seconds % 60
            return f"{minutes:02d}:{seconds:02d}"
        return "00:00"
    
    @property
    def lines_per_minute(self):
        """Calculate lines cleared per minute"""
        if self.duration_seconds and self.duration_seconds > 0:
            return round((self.lines_cleared * 60) / self.duration_seconds, 1)
        return 0
    
    @property
    def pieces_per_second(self):
        """Calculate pieces placed per second"""
        if self.duration_seconds and self.duration_seconds > 0:
            return round(self.pieces_placed / self.duration_seconds, 2)
        return 0

class Achievement(models.Model):
    """Define available achievements"""
    name = models.CharField(max_length=100)
    description = models.TextField(default='Achievement description')
    icon = models.CharField(max_length=50, default='trophy')  # Icon name
    
    # Achievement conditions (JSON field for flexibility)
    conditions = models.JSONField(default=dict)
    
    # Achievement rarity
    RARITY_CHOICES = [
        ('common', 'Common'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES, default='common')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class UserAchievement(models.Model):
    """Track user's earned achievements"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    game_session = models.ForeignKey(GameSession, on_delete=models.CASCADE, null=True, blank=True)
    
    earned_at = models.DateTimeField(auto_now_add=True)
    score_when_earned = models.IntegerField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'achievement']
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"

class UserStats(models.Model):
    """Aggregate user statistics"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Game counts
    total_games = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    
    # Best scores
    highest_score = models.IntegerField(default=0)
    highest_level = models.IntegerField(default=0)
    most_lines_cleared = models.IntegerField(default=0)
    longest_game_seconds = models.IntegerField(default=0)
    
    # Totals
    total_score = models.BigIntegerField(default=0)
    total_lines_cleared = models.IntegerField(default=0)
    total_pieces_placed = models.IntegerField(default=0)
    total_playtime_seconds = models.IntegerField(default=0)
    
    # Averages (calculated fields)
    average_score = models.FloatField(default=0)
    average_lines_per_game = models.FloatField(default=0)
    
    # Dates
    first_game_at = models.DateTimeField(null=True, blank=True)
    last_game_at = models.DateTimeField(null=True, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - Stats"
    
    def update_stats(self):
        """Recalculate all stats from game sessions"""
        games = GameSession.objects.filter(user=self.user)
        
        if games.exists():
            self.total_games = games.count()
            self.highest_score = games.aggregate(models.Max('score'))['score__max'] or 0
            self.highest_level = games.aggregate(models.Max('final_level'))['final_level__max'] or 0
            self.most_lines_cleared = games.aggregate(models.Max('lines_cleared'))['lines_cleared__max'] or 0
            self.longest_game_seconds = games.aggregate(models.Max('duration_seconds'))['duration_seconds__max'] or 0
            
            # Totals
            totals = games.aggregate(
                total_score=models.Sum('score'),
                total_lines=models.Sum('lines_cleared'),
                total_pieces=models.Sum('pieces_placed'),
                total_time=models.Sum('duration_seconds')
            )
            
            self.total_score = totals['total_score'] or 0
            self.total_lines_cleared = totals['total_lines'] or 0
            self.total_pieces_placed = totals['total_pieces'] or 0
            self.total_playtime_seconds = totals['total_time'] or 0
            
            # Averages
            if self.total_games > 0:
                self.average_score = self.total_score / self.total_games
                self.average_lines_per_game = self.total_lines_cleared / self.total_games
            
            # Dates
            self.first_game_at = games.earliest('created_at').created_at
            self.last_game_at = games.latest('created_at').created_at
        
        self.save()

# Signal to automatically update user stats when a game is saved
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=GameSession)
def update_user_stats(sender, instance, created, **kwargs):
    """Automatically update user stats when a game is saved"""
    if created:
        user_stats, created = UserStats.objects.get_or_create(user=instance.user)
        user_stats.update_stats()

# Keep the original Score model for backward compatibility
class Score(models.Model):
    """Legacy Score model - kept for backward compatibility"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()
    level = models.IntegerField(default=1)
    lines_cleared = models.IntegerField(default=0)
    duration = models.IntegerField(null=True, blank=True)
    date_played = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score', '-date_played']
    
    def __str__(self):
        return f"{self.user.username} - {self.score}"