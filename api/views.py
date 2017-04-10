from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseBadRequest, HttpResponseNotAllowed
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.db.models import Q

from .. import models

def leaderboard(request):
    json = '[' + ','.join(x.toLeaderboardEntryJSON() for x in models.UserInfo.objects.filter(~Q(score=-1)).order_by('-score')[:10]) + ']'
    return HttpResponse(json, content_type='application/json')

'''
Get information about a specific user
'''
def userinfo(request):
    try:
        username = request.GET['username']
    except KeyError:
        return HttpResponseBadRequest('{"error":"Username not specified."}', content_type='application/json')
    
    try:
        user = User.objects.get(username=username)
    except ObjectDoesNotExist:
        return HttpResponseNotFound('{"error":"User not found."}', content_type='application/json')
    
    return HttpResponse('{"user":}', content_type='application/json')
