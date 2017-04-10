from django.shortcuts import render
from django.http import HttpResponse

from .forms import *

def index(request):
    return render(request, 'FlappyClone/index.html', {})

def login(request):
    # If this is a POST request we will process the form data
    if request.method == 'POST' and request.POST.get('action', '') == 'login':
        login_form = LoginForm(request.POST)
        
        # If login form is valid, login and redirect to login url
        if login_form.is_valid():
            return HttpResponseRedirect('/login_successful/') # TODO: Implement login successful screen
        
        signup_form = SignupForm()
        
    elif request.method == 'POST' and request.POST.get('action', '') == 'login':
        signup_form = SignupForm(request.POST)
        
        # If signup form is valid, signup and redirect to signup url
        if signup_form.is_valid():
            # TODO: Sign up
            return HttpResponseRedirect('/signup_successful/') # TODO: Implement signup successful screen
        
        login_form = LoginForm()
    
    else:
        login_form = LoginForm()
        signup_form = SignupForm()
    
    return render(request, 'FlappyClone/login.html', {'login_form': login_form, 'signup_form': signup_form})
