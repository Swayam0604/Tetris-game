# admin.py - Fixed admin configuration

from django.contrib import admin
from django.utils.html import format_html
from .models import GameSession, Score, Achievement, UserAchievement, UserStats

@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'score', 'final_level', 'lines_cleared', 
        'duration_formatted', 'end_reason', 'created_at'
    ]
    list_filter = ['end_reason', 'final_level', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['duration_formatted', 'lines_per_minute', 'pieces_per_second']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Game Info', {
            'fields': ('user', 'score', 'final_level', 'lines_cleared')
        }),
        ('Timing', {
            'fields': ('started_at', 'ended_at', 'duration_seconds', 'duration_formatted')
        }),
        ('Detailed Stats', {
            'fields': ('pieces_placed', 'tetrises_cleared', 't_spins', 'max_combo')
        }),
        ('Game End', {
            'fields': ('end_reason', 'game_data')
        }),
        ('Calculated Stats', {
            'fields': ('lines_per_minute', 'pieces_per_second'),
            'classes': ('collapse',)
        })
    )
    
    def duration_formatted(self, obj):
        return obj.duration_formatted
    duration_formatted.short_description = 'Duration'

@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    """Legacy Score model admin"""
    list_display = ['user', 'score', 'level', 'lines_cleared', 'duration', 'date_played']
    list_filter = ['level', 'date_played']
    search_fields = ['user__username']
    ordering = ['-score', '-date_played']

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['name', 'rarity', 'created_at']
    list_filter = ['rarity', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'description', 'icon', 'rarity')
        }),
        ('Conditions', {
            'fields': ('conditions',),
            'description': 'JSON field defining when this achievement is earned'
        })
    )

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'achievement', 'earned_at', 'score_when_earned',
        'achievement_rarity'
    ]
    list_filter = ['achievement__rarity', 'earned_at']
    search_fields = ['user__username', 'achievement__name']
    ordering = ['-earned_at']
    
    def achievement_rarity(self, obj):
        colors = {
            'common': '#6B7280',
            'rare': '#3B82F6', 
            'epic': '#8B5CF6',
            'legendary': '#F59E0B'
        }
        color = colors.get(obj.achievement.rarity, '#6B7280')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.achievement.get_rarity_display()
        )
    achievement_rarity.short_description = 'Rarity'

@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'total_games', 'highest_score', 'highest_level',
        'total_playtime_formatted', 'last_game_at'
    ]
    list_filter = ['updated_at', 'last_game_at']
    search_fields = ['user__username']
    readonly_fields = [
        'total_games', 'games_won', 'highest_score', 'highest_level',
        'most_lines_cleared', 'longest_game_seconds', 'total_score',
        'total_lines_cleared', 'total_pieces_placed', 'total_playtime_seconds',
        'average_score', 'average_lines_per_game', 'first_game_at',
        'last_game_at', 'total_playtime_formatted'
    ]
    ordering = ['-highest_score']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Game Counts', {
            'fields': ('total_games', 'games_won')
        }),
        ('Best Records', {
            'fields': ('highest_score', 'highest_level', 'most_lines_cleared', 'longest_game_seconds')
        }),
        ('Totals', {
            'fields': ('total_score', 'total_lines_cleared', 'total_pieces_placed', 'total_playtime_seconds', 'total_playtime_formatted')
        }),
        ('Averages', {
            'fields': ('average_score', 'average_lines_per_game')
        }),
        ('Dates', {
            'fields': ('first_game_at', 'last_game_at', 'updated_at')
        })
    )
    
    def total_playtime_formatted(self, obj):
        if obj.total_playtime_seconds:
            hours = obj.total_playtime_seconds // 3600
            minutes = (obj.total_playtime_seconds % 3600) // 60
            seconds = obj.total_playtime_seconds % 60
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        return "00:00:00"
    total_playtime_formatted.short_description = 'Total Playtime'
    
    actions = ['refresh_stats']
    
    def refresh_stats(self, request, queryset):
        for user_stats in queryset:
            user_stats.update_stats()
        self.message_user(request, f"Refreshed stats for {queryset.count()} users.")
    refresh_stats.short_description = "Refresh selected user statistics"