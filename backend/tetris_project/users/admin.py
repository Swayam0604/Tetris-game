from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import CustomUser
from django.contrib.auth.admin import UserAdmin

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('exp',)}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
