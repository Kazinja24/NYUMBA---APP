from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Property


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "property_type",
        "price",
        "location",
        "is_available",
        "owner",
    )
    list_filter = ("property_type", "is_available")
    search_fields = ("title", "location", "owner__phone_number")
