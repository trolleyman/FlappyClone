from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib.auth import get_user_model, authenticate, login as auth_login, logout as auth_logout
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.urls import reverse
from django.contrib.auth.decorators import login_required


def index(request):
    return render(request, 'FlappyClone/game.html', {})

def account(request):
    # TODO
    return render(request, 'FlappyClone/account.html', {})
