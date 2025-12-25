from django.urls import path
from .views import (
    LoginAPIView,
    RegisterAPIView,
    LogoutAPIView,
    TenantDashboardAPIView,
)


app_name = "users"

urlpatterns = [
    path("login/", LoginAPIView.as_view(), name="users-login"),
     path('register/', RegisterAPIView.as_view(), name='user-register'),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("tenant/dashboard/", TenantDashboardAPIView.as_view()),
]
