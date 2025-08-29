#  game/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Window, F
from django.db.models.functions import Rank
from .models import Score, GameSession, Achievement, UserStats,UserAchievement
from .serializers import (
    ScoreSerializer, GameSessionSerializer, AchievementSerializer,UserAchievementSerializer,
    LeaderboardSerializer, UserStatsSerializer,UserProfileSerializer
)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def scores(request):
    if request.method == 'GET':
        scores_with_rank = Score.objects.annotate(
            rank=Window(
                expression=Rank(),
                order_by=F('score').desc()
            )
        ).select_related('user')[:10]  # Top 10 scores

        serializer = LeaderboardSerializer(scores_with_rank, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ScoreSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            score = serializer.save()
            check_achievements(request.user, score)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_scores(request):
    sessions = GameSession.objects.filter(user=request.user).order_by('-score')
    serializer = GameSessionSerializer(sessions, many=True)
    return Response(serializer.data)



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def game_sessions(request):
    if request.method == 'GET':
        sessions = GameSession.objects.filter(user=request.user, is_active=True)
        serializer = GameSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        GameSession.objects.filter(user=request.user, is_active=True).update(is_active=False)
        serializer = GameSessionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def game_session_detail(request, pk):
    try:
        session = GameSession.objects.get(pk=pk, user=request.user)
    except GameSession.DoesNotExist:
        return Response({'error': 'Game session not found'}, status=404)

    if request.method == 'PUT':
        serializer = GameSessionSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        session.delete()
        return Response(status=204)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_achievements(request):
    user_achievements = UserAchievement.objects.filter(user=request.user)
    serializer = UserAchievementSerializer(user_achievements, many=True)
    return Response(serializer.data)

from django.db.models import Max
from django.db.models.expressions import Subquery, OuterRef

from django.db.models import OuterRef, Subquery
from .models import GameSession

@api_view(['GET'])
@permission_classes([AllowAny])
def global_leaderboard(request):
    # Subquery: for each user, get pk of their highest scoring session
    top_sessions = GameSession.objects.filter(
        user=OuterRef('user')
    ).order_by('-score', 'created_at')

    qs = GameSession.objects.filter(
        pk=Subquery(top_sessions.values('pk')[:1])
    ).order_by('-score')

    serializer = LeaderboardSerializer(qs, many=True)
    return Response(serializer.data)


def check_achievements(user, score):
    achievements_to_create = []

    if user.games_played == 1:
        achievements_to_create.append(Achievement(
            user=user,
            achievement_type='first_game',
            score_when_earned=score.score
        ))

    score_achievements = [
        (1000, 'score_1k'),
        (5000, 'score_5k'),
        (10000, 'score_10k'),
        (25000, 'score_25k'),
    ]

    for threshold, achievement_type in score_achievements:
        if score.score >= threshold and not Achievement.objects.filter(user=user, achievement_type=achievement_type).exists():
            achievements_to_create.append(Achievement(
                user=user,
                achievement_type=achievement_type,
                score_when_earned=score.score
            ))

    level_achievements = [
        (5, 'level_5'),
        (10, 'level_10'),
    ]

    for threshold, achievement_type in level_achievements:
        if score.level >= threshold and not Achievement.objects.filter(user=user, achievement_type=achievement_type).exists():
            achievements_to_create.append(Achievement(
                user=user,
                achievement_type=achievement_type,
                score_when_earned=score.score
            ))

    total_lines = sum(Score.objects.filter(user=user).values_list('lines_cleared', flat=True))
    lines_achievements = [
        (100, 'lines_100'),
        (500, 'lines_500'),
    ]

    for threshold, achievement_type in lines_achievements:
        if total_lines >= threshold and not Achievement.objects.filter(user=user, achievement_type=achievement_type).exists():
            achievements_to_create.append(Achievement(
                user=user,
                achievement_type=achievement_type,
                score_when_earned=score.score
            ))

    games_achievements = [
        (10, 'games_10'),
        (50, 'games_50'),
    ]

    for threshold, achievement_type in games_achievements:
        if user.games_played >= threshold and not Achievement.objects.filter(user=user, achievement_type=achievement_type).exists():
            achievements_to_create.append(Achievement(
                user=user,
                achievement_type=achievement_type,
                score_when_earned=score.score
            ))

    if achievements_to_create:
        Achievement.objects.bulk_create(achievements_to_create)


class GameHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = GameSession.objects.filter(user=request.user).order_by('-created_at')
        serializer = GameSessionSerializer(sessions, many=True)
        return Response(serializer.data)


from .models import UserStats
from .serializers import UserStatsSerializer


class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_stats, _ = UserStats.objects.get_or_create(user=request.user)
        serializer = UserStatsSerializer(user_stats)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_score(request):
    serializer = GameSessionSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        session = serializer.save()

        user = request.user
        score_value = session.score

        # UPDATE GLOBAL STATS ON USER 
        user.total_score += score_value
        user.games_played += 1
        if score_value > user.highest_score:
            user.highest_score = score_value

        # ADD EXP (scaled: 1000 score = 10 EXP)
        exp_gained = score_value // 100   # integer division
        user.exp += exp_gained

        # LEVEL SYSTEM (Level 1 needs 1000 EXP, L2 needs 2000, etc.)
        while user.exp >= user.player_level * 1000:
            user.exp -= user.player_level * 1000
            user.player_level += 1
        
        user.save()

        # CHECK ACHIEVEMENTS
        check_achievements(user, session)

        return Response(serializer.data, status=201)
    else:
        return Response(serializer.errors, status=400)
