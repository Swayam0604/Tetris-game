# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser

class UserRegistrationSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password_confirm', 'player_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match"})
        
        if CustomUser.objects.filter(player_name=attrs['player_name']).exists():
            raise serializers.ValidationError({"player_name": "This player name is already taken"})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)   # only needed if create_user doesn’t handle it
        user.save()
        return user

    
class UserLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()  # can be username or email
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs.get('identifier')
        password = attrs.get('password')

        # Try username first
        user = authenticate(username=identifier, password=password)
        
        # If username failed, try email
        if not user:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user_obj = User.objects.get(email=identifier)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        attrs['user'] = user
        return attrs

    
from rest_framework import serializers
from .models import CustomUser

class UserProfileSerializer(serializers.ModelSerializer):
    exp_needed_for_next_level = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'total_score',
            'games_played',
            'highest_score',
            'player_level',
            'player_name',
            'exp',
            'exp_needed_for_next_level',   # 👈 new
            'progress_percent',            # 👈 new
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'exp']

    def get_exp_needed_for_next_level(self, obj):
        return obj.player_level * 1000  # e.g. Level 2 needs 2000 EXP

    def get_progress_percent(self, obj):
        needed = obj.player_level * 1000
        if needed == 0:
            return 0
        return round((obj.exp / needed) * 100, 2)  # percentage to next level
