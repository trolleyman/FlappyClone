from django.conf.urls import url
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    url(r'^leaderboard$', views.leaderboard, name='leaderboard'),
    url(r'^userprofile$', views.userprofile, name='userprofile'),
]
