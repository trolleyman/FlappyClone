from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import LeaderboardEntry

# Define an inline admin descriptor for LeaderboardEntry model
# which acts a bit like a singleton
class LeaderboardEntryInline(admin.StackedInline):
    model = LeaderboardEntry
    can_delete = False
    verbose_name_plural = 'leaderboard_entry'

# Define a new User admin
class UserAdmin(BaseUserAdmin):
    inlines = (LeaderboardEntryInline, )

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
