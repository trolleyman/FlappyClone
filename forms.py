from django import forms

from .api.validation import *

class LoginForm(forms.Form):
    username = forms.CharField(max_length=USERNAME_MAX_LENGTH, validators=USERNAME_VALIDATORS, help_text=USERNAME_HELP_TEXT)
    password = forms.CharField(max_length=PASSWORD_MAX_LENGTH, widget=forms.PasswordInput(), validators=PASSWORD_VALIDATORS)

class SignupForm(forms.Form):
    username = forms.CharField(max_length=USERNAME_MAX_LENGTH, validators=USERNAME_VALIDATORS, help_text=USERNAME_HELP_TEXT)
    email = forms.CharField(max_length=EMAIL_MAX_LENGTH, validators=EMAIL_VALIDATORS)
    email_confirm = forms.CharField(max_length=EMAIL_MAX_LENGTH, validators=[])
    password = forms.CharField(max_length=PASSWORD_MAX_LENGTH, widget=forms.PasswordInput(), validators=PASSWORD_VALIDATORS)
    password_confirm = forms.CharField(max_length=PASSWORD_MAX_LENGTH, widget=forms.PasswordInput(), validators=[])
    
    def clean(self):
        """
        Ensure that confirm fields are equal.
        """
        cleaned_data = super(ContactForm, self).clean()
        if cleaned_data['email'] != cleaned_data['email_confirm']:
            raise ValidationError('Emails are not equal.')
        if cleaned_data['password'] != cleaned_data['password_confirm']:
            raise ValidationError('Passwords are not equal.')
        
