from django.urls import path
from .views import (
    PropertyCreateAPIView,
    PropertyListAPIView,
    MyPropertiesAPIView,
    PropertyDetailAPIView,
)

urlpatterns = [
    path("create/", PropertyCreateAPIView.as_view()),
    path("list/", PropertyListAPIView.as_view()),
    path("my-properties/", MyPropertiesAPIView.as_view()),
    path("<int:pk>/", PropertyDetailAPIView.as_view(), name='property-detail'),
]
