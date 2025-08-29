# management/commands/create_achievements.py
# Create this file in: game/management/commands/create_achievements.py

from django.core.management.base import BaseCommand
from game.models import Achievement

class Command(BaseCommand):
    help = 'Create initial achievements for the game'
    
    def handle(self, *args, **options):
        achievements = [
            {
                'name': 'First Steps',
                'description': 'Complete your first game',
                'rarity': 'common',
                'icon': 'play-circle',
                'conditions': {'games_played': 1}
            },
            {
                'name': 'Line Clearer',
                'description': 'Clear 10 lines in a single game',
                'rarity': 'common',
                'icon': 'zap',
                'conditions': {'lines_in_game': 10}
            },
            {
                'name': 'Century Club',
                'description': 'Score 1000 points in a single game',
                'rarity': 'common',
                'icon': 'target',
                'conditions': {'score': 1000}
            },
            {
                'name': 'Line Master',
                'description': 'Clear 50 lines in a single game',
                'rarity': 'rare',
                'icon': 'award',
                'conditions': {'lines_in_game': 50}
            },
            {
                'name': 'High Scorer',
                'description': 'Score 5000 points in a single game',
                'rarity': 'rare',
                'icon': 'star',
                'conditions': {'score': 5000}
            },
            {
                'name': 'Tetris Master',
                'description': 'Clear 4 lines at once (Tetris)',
                'rarity': 'rare',
                'icon': 'crown',
                'conditions': {'tetris_cleared': 1}
            },
            {
                'name': 'Speed Runner',
                'description': 'Complete a game in under 60 seconds',
                'rarity': 'epic',
                'icon': 'clock',
                'conditions': {'duration_under': 60}
            },
            {
                'name': 'Marathon Runner',
                'description': 'Play for more than 10 minutes',
                'rarity': 'rare',
                'icon': 'timer',
                'conditions': {'duration_over': 600}
            },
            {
                'name': 'Combo King',
                'description': 'Achieve a 5+ line combo',
                'rarity': 'epic',
                'icon': 'trending-up',
                'conditions': {'max_combo': 5}
            },
            {
                'name': 'Perfect Game',
                'description': 'Score 10,000 points in a single game',
                'rarity': 'epic',
                'icon': 'gem',
                'conditions': {'score': 10000}
            },
            {
                'name': 'Legendary Player',
                'description': 'Score 50,000 points in a single game',
                'rarity': 'legendary',
                'icon': 'trophy',
                'conditions': {'score': 50000}
            },
            {
                'name': 'T-Spin Wizard',
                'description': 'Perform 5 T-spins in a single game',
                'rarity': 'legendary',
                'icon': 'rotate-cw',
                'conditions': {'t_spins': 5}
            },
            {
                'name': 'Dedicated Player',
                'description': 'Play 100 games',
                'rarity': 'epic',
                'icon': 'heart',
                'conditions': {'total_games': 100}
            },
            {
                'name': 'Level 10 Master',
                'description': 'Reach level 10 in a game',
                'rarity': 'rare',
                'icon': 'trending-up',
                'conditions': {'level': 10}
            },
        ]
        
        created_count = 0
        for achievement_data in achievements:
            achievement, created = Achievement.objects.get_or_create(
                name=achievement_data['name'],
                defaults=achievement_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created achievement: {achievement.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Achievement already exists: {achievement.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new achievements')
        )