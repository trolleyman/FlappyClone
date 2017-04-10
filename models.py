from django.db import models
from django.forms import ModelForm

from django.contrib.auth.models import User

import json as js

class LeaderboardEntry(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    score = models.IntegerField(default=-1)
    date = models.DateTimeField(auto_now=True)
    
    def toJSON(self):
        return js.dumps({
            'username': self.user.get_username(),
            'score': self.score,
            'date': str(self.date),
        }, separators=(',',':'))
