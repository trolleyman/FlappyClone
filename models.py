from django.db import models
from django.forms import ModelForm
from django.db.models.signals import post_save
from django.contrib.auth.models import User

import json as js

def dumps(o):
    return js.dumps(o, separators=(',',':'))

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    score = models.IntegerField(default=-1)
    date = models.DateTimeField(default=None, null=True)
    
    def toLeaderboardEntryJSON(self):
        return dumps({
            'username': self.user.get_username(),
            'score': self.score,
        })
    
    def toJSON(self):
        return dumps({
            'username': self.user.get_username(),
            'email': self.user.email,
            'score': self.score,
            'date': str(self.date),
        })

def create_profile(sender, **kwargs):
    user = kwargs["instance"]
    if kwargs["created"]:
        up = UserProfile(user=user)
        up.save()
post_save.connect(create_profile, sender=User)
