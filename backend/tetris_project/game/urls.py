# game/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('scores/', views.scores, name='scores'),
    path('scores/user/', views.user_scores, name='user_scores'),
    path('game-sessions/', views.game_sessions, name='game_sessions'),
    path('game-sessions/<int:pk>/', views.game_session_detail, name='game_session_detail'),
    path('achievements/', views.user_achievements, name='user_achievements'),
    path('leaderboard/', views.global_leaderboard, name='global_leaderboard'),
    path('game-history/', views.GameHistoryView.as_view(), name='game_history'),
    path('user-stats/', views.UserStatsView.as_view(), name='user_stats'),
    path('submit-score/',views.submit_score, name='submit_score'),
]
