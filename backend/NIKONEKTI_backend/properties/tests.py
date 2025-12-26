from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

from .models import Property

User = get_user_model()


class PropertyAPITest(APITestCase):
	def setUp(self):
		# Create users
		self.landlord = User.objects.create_user(
			phone_number='+255700000100', full_name='Landlord', password='LandlordPass1!', role='LANDLORD'
		)
		self.tenant = User.objects.create_user(
			phone_number='+255700000101', full_name='Tenant', password='TenantPass1!'
		)
		self.admin = User.objects.create_user(
			phone_number='+255700000102', full_name='Admin', password='AdminPass1!'
		)
		self.admin.is_staff = True
		self.admin.save()

		self.landlord_token = Token.objects.create(user=self.landlord)
		self.tenant_token = Token.objects.create(user=self.tenant)
		self.admin_token = Token.objects.create(user=self.admin)

		# Create a property owned by landlord
		self.property = Property.objects.create(
			owner=self.landlord,
			title='Test Property',
			description='Nice place',
			property_type='HOUSE',
			price=100.00,
			location='City Center',
		)

		self.create_url = '/api/properties/create/'
		self.list_url = '/api/properties/list/'
		self.detail_url = f'/api/properties/{self.property.id}/'

	def test_create_property_by_landlord(self):
		self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.landlord_token.key)
		data = {
			'title': 'New House',
			'description': 'Lovely',
			'property_type': 'HOUSE',
			'price': '250.00',
			'location': 'Suburb',
		}
		response = self.client.post(self.create_url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['title'], 'New House')

	def test_create_property_unauthenticated(self):
		data = {
			'title': 'New House',
			'description': 'Lovely',
			'property_type': 'HOUSE',
			'price': '250.00',
			'location': 'Suburb',
		}
		response = self.client.post(self.create_url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_list_requires_auth(self):
		# unauthenticated
		response = self.client.get(self.list_url)
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

		# authenticated tenant
		self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.tenant_token.key)
		response = self.client.get(self.list_url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	def test_retrieve_property_authenticated(self):
		self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.tenant_token.key)
		response = self.client.get(self.detail_url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['id'], self.property.id)

	def test_update_requires_admin(self):
		new_data = {
			'title': 'Updated Title',
			'description': 'Updated',
			'property_type': 'HOUSE',
			'price': '150.00',
			'location': 'New Loc',
		}

		# landlord (not admin) should be forbidden
		self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.landlord_token.key)
		response = self.client.put(self.detail_url, new_data, format='json')
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

		# admin can update
		self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
		response = self.client.put(self.detail_url, new_data, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['title'], 'Updated Title')

	def test_delete_requires_admin(self):
		# landlord cannot delete
		self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.landlord_token.key)
		response = self.client.delete(self.detail_url)
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

		# admin can delete
		self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
		response = self.client.delete(self.detail_url)
		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


# Create your tests here.
