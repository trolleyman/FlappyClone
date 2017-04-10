from django.db import models
from django.forms import ModelForm

from django.contrib.auth.models import User

class LeaderboardEntry(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    score = models.IntegerField(default=-1)
    date = models.DateTimeField(auto_now=True)
