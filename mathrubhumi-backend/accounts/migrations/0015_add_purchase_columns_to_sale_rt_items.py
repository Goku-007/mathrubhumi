from django.db import migrations

FORWARD_SQL = r"""
ALTER TABLE public.sale_rt_items
    ADD COLUMN IF NOT EXISTS purchase_company_id smallint DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS purchase_id integer DEFAULT 0 NOT NULL;
"""

REVERSE_SQL = r"""
ALTER TABLE public.sale_rt_items
    DROP COLUMN IF EXISTS purchase_company_id,
    DROP COLUMN IF EXISTS purchase_id;
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_mark_unmanaged_models'),
        ('accounts', '0014_add_author_wise_title_sales_function'),
    ]

    operations = [
        migrations.RunSQL(sql=FORWARD_SQL, reverse_sql=REVERSE_SQL),
    ]
