from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import get_user_model, authenticate, login as auth_login
from django.core.exceptions import ObjectDoesNotExist, ValidationError

from .forms import *

def index(request):
    return render(request, 'FlappyClone/index.html', {})

def login(request):
    # If this is a POST request we will process the form data
    if request.method == 'POST' and request.POST.get('action', '') == 'login':
        login_form = LoginForm(request.POST)
        
        # If login form is valid, try to login
        if login_form.is_valid():
            try:
                # Get user for username entered
                username = login_form['username'].value()
                password = login_form['password'].value()
                user = get_user_model().objects.get(username__exact=username)
                
                # Check if user is active
                if not user.is_active:
                    raise ValidationError('User is not active')
                
                # Login
                user = authenticate(username=username, password=password)
                if user is not None:
                    auth_login(request, user)
                    return HttpResponseRedirect('login_successful/')
                else:
                    raise ValidationError('Invalid password.')
                
            except ObjectDoesNotExist:
                login_form.add_error('username', 'User does not exist.')
            except ValidationError as e:
                login_form.add_error('username', e)
        
        signup_form = SignupForm()
        
    elif request.method == 'POST' and request.POST.get('action', '') == 'login':
        signup_form = SignupForm(request.POST)
        
        # If signup form is valid, signup and redirect to signup url
        if signup_form.is_valid():
            # TODO: Sign up
            return HttpResponseRedirect('signup_successful/') # TODO: Implement signup successful screen
        
        login_form = LoginForm()
    
    else:
        login_form = LoginForm()
        signup_form = SignupForm()
    
    return render(request, 'FlappyClone/login.html', {'login_form': login_form, 'signup_form': signup_form})
