from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Property
from .serializers import PropertySerializer
from users.permissions import IsLandlord


class PropertyCreateAPIView(APIView):
    """
    Landlord creates property
    """
    permission_classes = [IsAuthenticated, IsLandlord]

    def post(self, request):
        serializer = PropertySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        property_obj = serializer.save(owner=request.user)

        return Response(
            PropertySerializer(property_obj).data,
            status=status.HTTP_201_CREATED
        )


class PropertyListAPIView(APIView):
    """
    List available properties (Tenant / Public)
    """
    permission_classes = []

    def get(self, request):
        properties = Property.objects.filter(is_available=True)
        serializer = PropertySerializer(properties, many=True)
        return Response(serializer.data)

class MyPropertiesAPIView(APIView):
    permission_classes = [IsAuthenticated, IsLandlord]

    def get(self, request):
        properties = Property.objects.filter(owner=request.user)
        serializer = PropertySerializer(properties, many=True)
        return Response(serializer.data)


