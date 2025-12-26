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

    extra_kwargs = {
        'title': {'required': True},
        'description': {'required': True},
        'price': {'required': True},
        'location': {'required': True},
    }

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate(self, data):
        # Ensure non-empty strings for title/description/location
        for field in ('title', 'description', 'location'):
            val = data.get(field)
            if val is None or (isinstance(val, str) and not val.strip()):
                raise serializers.ValidationError({field: "This field may not be blank."})
        return data
