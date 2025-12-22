from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_create_mathrubhumi_tables"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'purchase_rt_items'
                      AND column_name = 'currency_id'
                ) THEN
                    ALTER TABLE purchase_rt_items
                        ADD COLUMN currency_id smallint NOT NULL DEFAULT 0;
                END IF;
            END$$;
            """,
            reverse_sql="""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'purchase_rt_items'
                      AND column_name = 'currency_id'
                ) THEN
                    ALTER TABLE purchase_rt_items
                        DROP COLUMN currency_id;
                END IF;
            END$$;
            """,
        ),
    ]
