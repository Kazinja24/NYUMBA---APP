from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.authtoken.models import Token

from .serializers import LoginSerializer, RegisterSerializer
from .permissions import IsLandlord, IsTenant, IsAgent


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        return Response(
            serializer.validated_data,
            status=status.HTTP_200_OK
        )

class RegisterAPIView(APIView):
    """
    API endpoint for user registration.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        token = Token.objects.get(user=user)

        return Response(
            {
                "message": "User registered successfully",
                "token": token.key,
                "user_id": user.id,
                "role": user.role,
                "is_verified": user.is_verified,
            },
            status=status.HTTP_201_CREATED
        )


class LogoutAPIView(APIView):
    """
    API endpoint for user logout.
    Deletes the user's authentication token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()

        return Response(
            {"message": "Successfully logged out"},
            status=status.HTTP_200_OK
        )
