from django.db import migrations

# This table was already created in migration 0002_create_mathrubhumi_tables.
# Keeping this migration as no-op to preserve migration history.
FORWARD_SQL = "-- No-op: sale_types table already exists from 0002"

REVERSE_SQL = "-- No-op"


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_userbranch'),
    ]

    operations = [
        migrations.RunSQL(sql=FORWARD_SQL, reverse_sql=REVERSE_SQL),
    ]
