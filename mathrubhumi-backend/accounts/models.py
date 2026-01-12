from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone

# Role table
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

# Custom user manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

# Custom user model
class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email


class UserBranch(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="user_branches")
    branch_id = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "branch_id"], name="uniq_user_branch"),
        ]
        indexes = [
            models.Index(fields=["user", "branch_id"], name="accounts_us_user_id_d6d8ed_idx"),
            models.Index(fields=["branch_id"], name="accounts_us_branch__2a0b33_idx"),
        ]

# Customer table for credit sales
# Note: This table is managed via raw SQL in migration 0002, so Django should not manage it
class CrCustomer(models.Model):
    customer_name = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'cr_customers'

    def __str__(self):
        return self.customer_name

# Title/Product table
# Note: This table is managed via raw SQL in migration 0002, so Django should not manage it
class Title(models.Model):
    title = models.CharField(max_length=255)
    title_m = models.TextField(blank=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    language = models.IntegerField(default=0)

    class Meta:
        managed = False
        db_table = 'titles'

    def __str__(self):
        return self.title

# Sales table (optional)
# Note: This table is managed via raw SQL in migration 0002, so Django should not manage it
class Sales(models.Model):
    customer_name = models.CharField(max_length=255)
    billing_address = models.TextField()
    sale_date = models.DateField()
    mobile_number = models.CharField(max_length=20)
    type = models.CharField(max_length=50)
    mode = models.CharField(max_length=50)
    class_name = models.CharField(max_length=50, db_column='class')  # Alias 'class' field
    cancel = models.CharField(max_length=10)
    bill_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    bill_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    gross = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    round_off = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    bill_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    note_1 = models.TextField(blank=True)
    note_2 = models.TextField(blank=True)
    freight_postage = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    processing_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    class Meta:
        managed = False
        db_table = 'sales'

    def __str__(self):
        return f"Sale {self.id}"

# Sale Items table (optional)
# Note: This table is managed via raw SQL in migration 0002, so Django should not manage it
class SaleItem(models.Model):
    sale = models.ForeignKey(Sales, related_name='items', on_delete=models.CASCADE)
    sku = models.CharField(max_length=50, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    discount_p = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'sale_items'

    def __str__(self):
        return f"Item {self.item_name} for Sale {self.sale.id}"
