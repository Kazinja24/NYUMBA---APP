from rest_framework.permissions import BasePermission


class IsTenant(BasePermission):
    """
    Allows access only to TENANT users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'TENANT'
        )


class IsLandlord(BasePermission):
    """
    Allows access only to LANDLORD users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'LANDLORD'
        )


class IsAgent(BasePermission):
    """
    Allows access only to AGENT users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'AGENT'
        )
