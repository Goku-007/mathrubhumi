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

# Customer table for credit sales
class CrCustomer(models.Model):
    customer_name = models.CharField(max_length=255)

    def __str__(self):
        return self.customer_name

# Title/Product table
class Title(models.Model):
    title = models.CharField(max_length=255)
    title_m = models.TextField(blank=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    language = models.IntegerField(default=0)

    def __str__(self):
        return self.title

# Sales table (optional)
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

    def __str__(self):
        return f"Sale {self.id}"

# Sale Items table (optional)
class SaleItem(models.Model):
    sale = models.ForeignKey(Sales, related_name='items', on_delete=models.CASCADE)
    sku = models.CharField(max_length=50, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    discount_p = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=50)

    def __str__(self):
        return f"Item {self.item_name} for Sale {self.sale.id}"