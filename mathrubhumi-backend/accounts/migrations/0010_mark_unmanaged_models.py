from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0009_add_database_functions'),
    ]

    # State operations: Update Django's migration state to record these models as unmanaged
    # Database operations: Empty - tables already exist from migration 0002
    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                # Record CrCustomer as unmanaged model
                migrations.CreateModel(
                    name='CrCustomer',
                    fields=[
                        ('id', models.AutoField(primary_key=True)),
                        ('customer_name', models.CharField(max_length=255)),
                    ],
                    options={
                        'managed': False,
                        'db_table': 'cr_customers',
                    },
                ),
                # Record Title as unmanaged model
                migrations.CreateModel(
                    name='Title',
                    fields=[
                        ('id', models.AutoField(primary_key=True)),
                        ('title', models.CharField(max_length=255)),
                        ('title_m', models.TextField(blank=True)),
                        ('rate', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('language', models.IntegerField(default=0)),
                    ],
                    options={
                        'managed': False,
                        'db_table': 'titles',
                    },
                ),
                # Record Sales as unmanaged model
                migrations.CreateModel(
                    name='Sales',
                    fields=[
                        ('id', models.AutoField(primary_key=True)),
                        ('customer_name', models.CharField(max_length=255)),
                        ('billing_address', models.TextField()),
                        ('sale_date', models.DateField()),
                        ('mobile_number', models.CharField(max_length=20)),
                        ('type', models.CharField(max_length=50)),
                        ('mode', models.CharField(max_length=50)),
                        ('class_name', models.CharField(max_length=50, db_column='class')),
                        ('cancel', models.CharField(max_length=10)),
                        ('bill_discount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                        ('bill_discount_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                        ('gross', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                        ('round_off', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                        ('bill_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                        ('note_1', models.TextField(blank=True)),
                        ('note_2', models.TextField(blank=True)),
                        ('freight_postage', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                        ('processing_charge', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                    ],
                    options={
                        'managed': False,
                        'db_table': 'sales',
                    },
                ),
                # Record SaleItem as unmanaged model
                migrations.CreateModel(
                    name='SaleItem',
                    fields=[
                        ('id', models.AutoField(primary_key=True)),
                        ('sku', models.CharField(blank=True, max_length=50)),
                        ('quantity', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('rate', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('discount_p', models.DecimalField(decimal_places=2, default=0.0, max_digits=5)),
                        ('value', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('currency', models.CharField(max_length=50)),
                        ('sale', models.ForeignKey(on_delete=models.CASCADE, related_name='items', to='accounts.sales')),
                    ],
                    options={
                        'managed': False,
                        'db_table': 'sale_items',
                    },
                ),
            ],
            database_operations=[],
        ),
    ]
