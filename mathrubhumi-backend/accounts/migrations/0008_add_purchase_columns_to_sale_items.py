from django.db import migrations

FORWARD_SQL = r"""
ALTER TABLE public.sale_items
    ADD COLUMN IF NOT EXISTS purchase_company_id smallint DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS purchase_id integer DEFAULT 0 NOT NULL;
"""

REVERSE_SQL = r"""
ALTER TABLE public.sale_items
    DROP COLUMN IF EXISTS purchase_company_id,
    DROP COLUMN IF EXISTS purchase_id;
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_add_sale_types_table'),
    ]

    operations = [
        migrations.RunSQL(sql=FORWARD_SQL, reverse_sql=REVERSE_SQL),
    ]



