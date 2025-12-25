from rest_framework.permissions import BasePermission


def is_admin_user(user) -> bool:
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
        return True
    role = getattr(user, "role", None)
    role_name = getattr(role, "name", None)
    return isinstance(role_name, str) and role_name.strip().lower() == "admin"


class IsAdminRole(BasePermission):
    message = "Admin permissions required."

    def has_permission(self, request, view):
        return is_admin_user(request.user)

