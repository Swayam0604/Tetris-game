from rest_framework import serializers
from .models import (
    Score, GameSession, Achievement, UserAchievement, UserStats
)
from users.serializers import UserProfileSerializer

# Legacy Score Serializer (for backward compatibility)
class ScoreSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Score
        fields = [
            'id', 'user', 'username', 'score', 'level',
            'lines_cleared', 'duration', 'date_played'
        ]
        read_only_fields = ['id', 'user', 'date_played']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

# Enhanced GameSession Serializer
class GameSessionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    end_reason_display = serializers.CharField(source='get_end_reason_display', read_only=True)
    duration_formatted = serializers.CharField(read_only=True)
    lines_per_minute = serializers.FloatField(read_only=True)
    pieces_per_second = serializers.FloatField(read_only=True)

    class Meta:
        model = GameSession
        fields = [
            'id', 'user', 'score', 'final_level', 'lines_cleared', 'pieces_placed',
            'tetrises_cleared', 't_spins', 'max_combo', 'started_at', 'ended_at',
            'duration_seconds', 'duration_formatted', 'lines_per_minute',
            'pieces_per_second', 'end_reason', 'end_reason_display', 'game_data',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'started_at', 'ended_at', 'duration_formatted',
            'lines_per_minute', 'pieces_per_second', 'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

# Achievement definition serializer
class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = [
            'id', 'name', 'description', 'icon', 'conditions',
            'rarity', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

# Serializer for achievements earned by users
class UserAchievementSerializer(serializers.ModelSerializer):
    achievement_name = serializers.CharField(source='achievement.name', read_only=True)
    achievement_icon = serializers.CharField(source='achievement.icon', read_only=True)
    rarity = serializers.CharField(source='achievement.rarity', read_only=True)

    class Meta:
        model = UserAchievement
        fields = [
            'id', 'achievement', 'achievement_name', 'achievement_icon', 'rarity',
            'game_session', 'earned_at', 'score_when_earned'
        ]
        read_only_fields = ['id', 'earned_at']

# Aggregate user statistics serializer
class UserStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStats
        fields = [
            'user', 'total_games', 'games_won', 'highest_score', 'highest_level',
            'most_lines_cleared', 'longest_game_seconds', 'total_score', 'total_lines_cleared',
            'total_pieces_placed', 'total_playtime_seconds', 'average_score',
            'average_lines_per_game', 'first_game_at', 'last_game_at', 'updated_at'
        ]
        read_only_fields = fields

# GameSession-based leaderboard serializer
class LeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = GameSession
        fields = [
            'id', 'username', 'score', 'final_level', 'lines_cleared',
            'duration_seconds', 'created_at'
        ]
        read_only_fields = fields
