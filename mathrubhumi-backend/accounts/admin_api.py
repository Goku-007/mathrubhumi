import logging

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import connection, transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import CustomUser, Role, UserBranch
from .permissions import is_admin_user

logger = logging.getLogger(__name__)


def _validate_branch_ids(branch_ids):
    if not isinstance(branch_ids, list) or not branch_ids:
        return None, "At least one branch is required."

    cleaned = []
    for b in branch_ids:
        try:
            bid = int(b)
        except (TypeError, ValueError):
            return None, "Invalid branch selection."
        if bid <= 0:
            return None, "Invalid branch selection."
        cleaned.append(bid)

    cleaned = sorted(set(cleaned))
    placeholders = ", ".join(["%s"] * len(cleaned))
    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT id FROM branches WHERE id IN ({placeholders})",
            cleaned,
        )
        existing = {r[0] for r in cursor.fetchall()}

    if len(existing) != len(cleaned):
        return None, "One or more selected branches are invalid."

    return cleaned, None


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def users_admin(request):
    if not is_admin_user(request.user):
        return Response({"error": "Admin permissions required."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        users = (
            CustomUser.objects.select_related("role")
            .all()
            .order_by("id")
            .values("id", "email", "name", "is_active", "is_staff", "is_superuser", "role__name")
        )
        user_ids = [u["id"] for u in users]
        branch_map = {uid: [] for uid in user_ids}
        for ub in UserBranch.objects.filter(user_id__in=user_ids).values("user_id", "branch_id"):
            branch_map.setdefault(ub["user_id"], []).append(ub["branch_id"])
        out = []
        for u in users:
            role_name = u.get("role__name") or ""
            if u.get("is_superuser") or u.get("is_staff") or role_name.strip().lower() == "admin":
                role_name = "Admin"
            out.append(
                {
                    "id": u["id"],
                    "email": u["email"],
                    "name": u["name"],
                    "is_active": u["is_active"],
                    "role": role_name or "Staff",
                    "branch_ids": sorted(branch_map.get(u["id"], [])),
                }
            )
        return Response(out)

    data = request.data or {}
    email = (data.get("email") or "").strip().lower()
    name = (data.get("name") or "").strip()
    password = data.get("password") or ""
    role_name = (data.get("role") or "").strip()
    branch_ids = data.get("branch_ids") or []

    allowed_roles = {"manager", "staff"}
    if role_name.lower() not in allowed_roles:
        return Response(
            {"error": "Role must be Manager or Staff."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not email or not name or not password:
        return Response({"error": "Missing fields."}, status=status.HTTP_400_BAD_REQUEST)

    branch_ids, branch_err = _validate_branch_ids(branch_ids)
    if branch_err:
        return Response({"error": branch_err}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(email=email).exists():
        return Response({"error": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(password)
    except ValidationError as e:
        return Response({"error": e.messages}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        role, _ = Role.objects.get_or_create(name=role_name.title())
        user = CustomUser.objects.create_user(email=email, password=password, name=name, role=role)
        UserBranch.objects.bulk_create(
            [UserBranch(user=user, branch_id=bid) for bid in branch_ids],
            ignore_conflicts=True,
        )

    return Response(
        {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": role.name,
            "branch_ids": branch_ids,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def user_admin_detail(request, user_id: int):
    if not is_admin_user(request.user):
        return Response({"error": "Admin permissions required."}, status=status.HTTP_403_FORBIDDEN)

    try:
        target = CustomUser.objects.select_related("role").get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    role_name = (getattr(getattr(target, "role", None), "name", "") or "").strip().lower()
    is_target_admin = bool(target.is_superuser or target.is_staff or role_name == "admin")
    if is_target_admin:
        return Response({"error": "Admin accounts cannot be modified here."}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        if request.user.id == target.id:
            return Response({"error": "You cannot delete your own account."}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            UserBranch.objects.filter(user=target).delete()
            target.is_active = False
            target.set_unusable_password()
            target.save(update_fields=["is_active", "password"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    data = request.data or {}
    new_name = data.get("name", None)
    new_role = data.get("role", None)
    new_branch_ids = data.get("branch_ids", None)
    new_is_active = data.get("is_active", None)

    if new_role is not None:
        allowed_roles = {"manager", "staff"}
        if str(new_role).strip().lower() not in allowed_roles:
            return Response({"error": "Role must be Manager or Staff."}, status=status.HTTP_400_BAD_REQUEST)

    if new_branch_ids is not None:
        cleaned, branch_err = _validate_branch_ids(new_branch_ids)
        if branch_err:
            return Response({"error": branch_err}, status=status.HTTP_400_BAD_REQUEST)
        new_branch_ids = cleaned

    if new_is_active is not None and not isinstance(new_is_active, bool):
        return Response({"error": "is_active must be boolean."}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        if new_name is not None:
            target.name = str(new_name).strip()
        if new_role is not None:
            role, _ = Role.objects.get_or_create(name=str(new_role).strip().title())
            target.role = role
        if new_is_active is not None:
            target.is_active = new_is_active
        target.save()

        if new_branch_ids is not None:
            UserBranch.objects.filter(user=target).delete()
            UserBranch.objects.bulk_create(
                [UserBranch(user=target, branch_id=bid) for bid in new_branch_ids],
                ignore_conflicts=True,
            )

    current_branch_ids = sorted(
        UserBranch.objects.filter(user=target).values_list("branch_id", flat=True)
    )
    out_role_name = (getattr(getattr(target, "role", None), "name", "") or "").strip() or "Staff"
    return Response(
        {
            "id": target.id,
            "email": target.email,
            "name": target.name,
            "role": out_role_name,
            "is_active": target.is_active,
            "branch_ids": current_branch_ids,
        }
    )
