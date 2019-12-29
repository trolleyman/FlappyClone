from django.http import (
    HttpResponse, HttpResponseNotFound, HttpResponseForbidden, HttpResponseBadRequest,
    HttpResponseNotAllowed)
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.contrib.auth.models import User

from datetime import datetime, timezone

from .validation import is_valid_name
from .. import models


def leaderboard(request):
    """Gets the current top 10 players"""
    json = '[' + ','.join(x.to_json() for x in models.LeaderboardEntry.objects.order_by('-score')[:10]) + ']'
    return HttpResponse(json, content_type='application/json')


def submit(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('{"error":"Only POST allowed."}', content_type='application/json')

    # Get POST parameters
    try:
        name = request.POST['name']
        score = request.POST['score']

        # Validate name
        if (not is_valid_name(name)):
            raise ValueError()

        # Validate score
        if (int(score) <= 0):
            raise ValueError()
        score = int(score)

    except (KeyError, ValueError):
        return HttpResponseBadRequest('{"error":"Bad request."}', content_type='application/json');

    # Submit to database
    models.LeaderboardEntry(name=name, score=score, date=datetime.utcnow().replace(tzinfo=timezone.utc)).save()

    json = '{"success":""}'
    return HttpResponse(json, content_type='application/json')
