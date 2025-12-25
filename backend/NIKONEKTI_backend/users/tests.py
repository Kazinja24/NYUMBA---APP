from django.test import TestCase
from django.contrib.auth import get_user_model

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


from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse


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
