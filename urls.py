from django.conf.urls import include, url
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    url(r'^$', views.index, name='game'),
    url(r'^api/', include('FlappyClone.api.urls'), name='api'),
    url(r'^login$', views.login, name='login'),
    url(r'^logout$', views.logout, name='logout'),
    url(r'^account$', views.account, name='account'),
    
    # Password modification URLs
    url(r'^password_change$',
        auth_views.PasswordChangeView.as_view(template_name='FlappyClone/password_change.html', success_url='password_change_done'),
        name='password_change'),
    url(r'^password_change_done$',
        auth_views.PasswordChangeDoneView.as_view(template_name='FlappyClone/password_change_done.html'),
        name='password_change_done'),
    url(r'^password_reset$',
        auth_views.PasswordResetView.as_view(template_name='FlappyClone/password_reset.html', email_template_name='FlappyClone/password_reset_email.html', subject_template_name='FlappyClone/password_reset_subject.txt', success_url='password_reset_done'),
        name='password_reset'),
    url(r'^password_reset_done$',
        auth_views.PasswordResetDoneView.as_view(template_name='FlappyClone/password_reset_done.html'),
        name='password_reset_done'),
    url(r'^reset$',
        auth_views.PasswordResetConfirmView.as_view(template_name='FlappyClone/password_reset_confirm.html', post_reset_login=True, success_url='password_reset_complete'),
        name='password_reset_confirm'),
    url(r'^reset_done$',
        auth_views.PasswordResetCompleteView.as_view(template_name='FlappyClone/password_reset_complete.html'),
        name='password_reset_complete'),
]
