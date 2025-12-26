from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()


class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            phone_number="+255700000001",
            full_name="Test User",
            password="testpassword123"
        )

        self.assertEqual(user.phone_number, "+255700000001")
        self.assertEqual(user.full_name, "Test User")
        self.assertTrue(user.check_password("testpassword123"))
        self.assertTrue(user.is_active)


class UserRegistrationAPITest(APITestCase):
    def test_user_registration(self):
        url = reverse('users:user-register')

        data = {
            "phone_number": "+255700000002",
            "full_name": "API Test User",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
            "role": "TENANT", 
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)


class UserLoginAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number="+255700000003",
            full_name="Login Test User",
            password="LoginPass123!"
        )
        self.login_url = reverse('users:users-login')
        self.logout_url = reverse('users:logout')

    def test_successful_login(self):
        data = {
            "phone_number": "+255700000003",
            "password": "LoginPass123!"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user_id"], self.user.id)
        self.assertEqual(response.data["role"], self.user.role)
        self.assertEqual(response.data["is_verified"], self.user.is_verified)

    def test_login_with_invalid_password(self):
        data = {
            "phone_number": "+255700000003",
            "password": "WrongPass123!"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid phone number or password", response.data["non_field_errors"][0])

    def test_login_with_non_existent_user(self):
        data = {
            "phone_number": "+255700000009",
            "password": "AnyPass123!"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid phone number or password", response.data["non_field_errors"][0])

    def test_login_missing_fields(self):
        data = {
            "phone_number": "+255700000003"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Must include \"phone_number\" and \"password\"", response.data["non_field_errors"][0])


class UserLogoutAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number="+255700000004",
            full_name="Logout Test User",
            password="LogoutPass123!"
        )
        self.token = Token.objects.create(user=self.user)
        self.logout_url = reverse('users:logout')

    def test_successful_logout(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Successfully logged out", response.data["message"])
        self.assertFalse(Token.objects.filter(user=self.user).exists())

    def test_logout_without_authentication(self):
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_access_with_invalid_token(self):
        # Delete the token, then attempt to access a protected endpoint
        token_key = self.token.key
        self.token.delete()

        # Attempt to access tenant dashboard using the deleted token
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token_key)
        response = self.client.get('/api/users/tenant/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RegistrationNegativeTests(APITestCase):
    def test_duplicate_registration(self):
        url = reverse('users:user-register')

        data = {
            "phone_number": "+255700000010",
            "full_name": "Dup User",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
            "role": "TENANT",
        }

        # First registration should succeed
        response1 = self.client.post(url, data, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        # Second registration with same phone_number should fail
        response2 = self.client.post(url, data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('phone_number', response2.data)
        # error message can vary in capitalization/format; check key phrase
        self.assertIn('phone number', str(response2.data['phone_number']).lower())

    def test_weak_password_rejection(self):
        url = reverse('users:user-register')

        data = {
            "phone_number": "+255700000011",
            "full_name": "WeakPass User",
            "password": "12345",
            "password2": "12345",
            "role": "TENANT",
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Password validators should report an error on the 'password' field
        self.assertIn('password', response.data)
