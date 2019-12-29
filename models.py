from django.db import models
from django.db.models.signals import post_save
from django.contrib.auth.models import User

import json


def to_json(o):
    return json.dumps(o, separators=(',', ':'))


class LeaderboardEntry(models.Model):
    name = models.CharField(max_length=127)
    score = models.IntegerField()
    date = models.DateTimeField()

    def to_json(self):
        return to_json({
            'name' : self.name,
            'score': self.score,
            'date' : str(self.date),
            'medal': self.medal,
        })

    @property
    def medal(self):
        if self.score <= 4:
            return 0  # None
        elif self.score <= 15:
            return 1  # Bronze
        elif self.score <= 30:
            return 2  # Silver
        else:
            return 3  # Gold

    def __str__(self):
        return '{}: {} - {}'.format(self.name, self.score, str(self.date))
