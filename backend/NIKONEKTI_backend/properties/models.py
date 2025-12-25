from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings


class Property(models.Model):
    PROPERTY_TYPE_CHOICES = (
        ("APARTMENT", "Apartment"),
        ("HOUSE", "House"),
        ("ROOM", "Room"),
        ("COMMERCIAL", "Commercial"),
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="properties"
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    property_type = models.CharField(
        max_length=20,
        choices=PROPERTY_TYPE_CHOICES
    )

    price = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=255)

    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.owner.phone_number}"
