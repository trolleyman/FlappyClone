# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-04-10 22:55
from __future__ import unicode_literals

from django.db import migrations

def reset_scores(apps, schema_editor):
    UserProfile = apps.get_model("FlappyClone", "UserProfile")
    for profile in UserProfile.objects.all():
        if profile.score == -1:
            profile.score = 0
            profile.save()

class Migration(migrations.Migration):

    dependencies = [
        ('FlappyClone', '0005_auto_20170410_2351'),
    ]

    operations = [
        migrations.RunPython(reset_scores),
    ]
