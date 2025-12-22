from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0003_add_currency_to_purchase_rt_items"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'purchase_rt_items' AND column_name = 'purchase_company_id'
                ) THEN
                    ALTER TABLE purchase_rt_items
                        ADD COLUMN purchase_company_id smallint NOT NULL DEFAULT 0;
                END IF;
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'purchase_rt_items' AND column_name = 'purchase_id'
                ) THEN
                    ALTER TABLE purchase_rt_items
                        ADD COLUMN purchase_id integer NOT NULL DEFAULT 0;
                END IF;
            END$$;
            """,
            reverse_sql="""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'purchase_rt_items' AND column_name = 'purchase_company_id'
                ) THEN
                    ALTER TABLE purchase_rt_items DROP COLUMN purchase_company_id;
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'purchase_rt_items' AND column_name = 'purchase_id'
                ) THEN
                    ALTER TABLE purchase_rt_items DROP COLUMN purchase_id;
                END IF;
            END$$;
            """,
        ),
    ]
