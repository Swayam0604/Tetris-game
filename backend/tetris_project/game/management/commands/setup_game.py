from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Setup initial data for the game'

    def handle(self, *args, **options):
        # CREATE A SUPERUSER IF IT DOESN'T EXIST
        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@tetris.com'
            )
            self.stdout.write(self.style.SUCCESS('Superuser created successfully.'))
        self.stdout.write(self.style.SUCCESS('Game Setup completed!!.'))