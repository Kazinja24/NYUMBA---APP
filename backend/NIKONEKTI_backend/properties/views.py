from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Property
from .serializers import PropertySerializer
from users.permissions import IsLandlord, IsAdmin


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
    permission_classes = [IsAuthenticated]

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


class PropertyDetailAPIView(APIView):
    """
    Retrieve, update, or delete a property.
    GET: any authenticated user
    PUT/PATCH/DELETE: admin users only
    """

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_object(self, pk):
        try:
            return Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return None

    def get(self, request, pk):
        prop = self.get_object(pk)
        if not prop:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PropertySerializer(prop)
        return Response(serializer.data)

    def put(self, request, pk):
        prop = self.get_object(pk)
        if not prop:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Admin-only enforced by get_permissions
        serializer = PropertySerializer(prop, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        prop = self.get_object(pk)
        if not prop:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        prop.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


