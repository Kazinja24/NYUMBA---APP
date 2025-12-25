from rest_framework import serializers
from .models import Property


class PropertySerializer(serializers.ModelSerializer):
    owner_phone = serializers.CharField(
        source="owner.phone_number",
        read_only=True
    )

    class Meta:
        model = Property
        fields = (
            "id",
            "title",
            "description",
            "property_type",
            "price",
            "location",
            "is_available",
            "owner_phone",
            "created_at",
        )
