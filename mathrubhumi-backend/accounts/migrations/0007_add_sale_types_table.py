from django.db import migrations

FORWARD_SQL = r"""
CREATE TABLE IF NOT EXISTS public.sale_types (
    sale_typeid int4 NOT NULL,
    sale_type varchar(15) NULL,
    CONSTRAINT sale_types_unique UNIQUE (sale_typeid)
);
"""

REVERSE_SQL = r"""
DROP TABLE IF EXISTS public.sale_types CASCADE;
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_userbranch'),
    ]

    operations = [
        migrations.RunSQL(sql=FORWARD_SQL, reverse_sql=REVERSE_SQL),
    ]
