# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-04-10 22:00
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('FlappyClone', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='LeaderboardEntry',
            new_name='UserInfo',
        ),
    ]