from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, ProfileView, UserMeView,
    PasswordResetRequestView, PasswordResetVerifyCodeView, PasswordResetConfirmView,
    CheckEmailView, EmailChangeRequestView, EmailChangeConfirmView, ChangePasswordView,
    UserSettingsView, DeleteAccountView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserMeView.as_view(), name='me'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('settings/', UserSettingsView.as_view(), name='user-settings'),
    path('profile/email-change/request/', EmailChangeRequestView.as_view(), name='email_change_request'),
    path('profile/email-change/confirm/', EmailChangeConfirmView.as_view(), name='email_change_confirm'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('check-email/', CheckEmailView.as_view(), name='check_email'),
    
    # Password Reset
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/verify-code/', PasswordResetVerifyCodeView.as_view(), name='password_reset_verify'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Delete Account
    path('delete-account/', DeleteAccountView.as_view(), name='delete_account'),
]
