from django.db import migrations

# Function: get_cial_sales_register
CIAL_FUNCTION_SQL = r"""
CREATE OR REPLACE FUNCTION public.get_cial_sales_register(
    p_company_id integer,
    p_from_date date,
    p_to_date date
)
RETURNS TABLE(o_sale_date date, nos integer, o_nett_sale numeric, o_discount numeric)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
        SELECT
            sl.sale_date,
            COUNT(*)::INT4 AS nos,
            SUM(sl.bill_amount)::Numeric AS nett_sale,
            SUM(
                (
                    (si.quantity * si.rate * si.exchange_rate) 
                    * (si.discount_p / 100)
                ) 
                + si.allocated_bill_discount
            )::Numeric AS discount
         FROM sales sl 
         JOIN sale_items si ON si.company_id = sl.company_id AND si.sale_id = sl.id
        WHERE sl.company_id = p_company_id 
          AND sl.sale_date BETWEEN p_from_date AND p_to_date 
          AND sl."type" IN (0, 1, 7) 
          AND sl.cancel = 0
        GROUP BY sl.sale_date
        ORDER BY sl.sale_date;
END;
$$;
"""

CIAL_REVERSE_SQL = r"""
DROP FUNCTION IF EXISTS public.get_cial_sales_register(integer, date, date);
"""

# Function: get_abc_sales_register
ABC_FUNCTION_SQL = r"""
CREATE OR REPLACE FUNCTION public.get_abc_sales_register(
    p_company_id integer,
    p_from_date date,
    p_to_date date
)
RETURNS TABLE(o_title character varying, o_quantity integer)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
        SELECT t.title, SUM(si.quantity)::INT4 AS quantity
        FROM sale_items si 
        JOIN sales sl ON sl.company_id = si.company_id AND sl.id = si.sale_id 
        JOIN titles t ON si.title_id = t.id
        WHERE sl.company_id = p_company_id 
          AND sl.sale_date BETWEEN p_from_date AND p_to_date 
          AND sl."type" IN (0, 1, 7) 
          AND sl.cancel = 0
          AND t.publisher_id = 7229
          AND (
                 t.title ILIKE 'MATHRUBHUMI DAILY (Weekdays)'
              OR t.title ILIKE 'MATHRUBHUMI DAILY (Sunday)'
              OR t.title LIKE 'TVNC%'
              OR t.title LIKE 'BBAC%'
              OR t.title LIKE 'AMNC%'
              OR t.title LIKE 'GLNC%'
              OR t.title LIKE 'WKAC%'
          )
        GROUP BY t.title;
END;
$$;
"""

ABC_REVERSE_SQL = r"""
DROP FUNCTION IF EXISTS public.get_abc_sales_register(integer, date, date);
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_add_purchase_columns_to_sale_items'),
    ]

    operations = [
        migrations.RunSQL(sql=CIAL_FUNCTION_SQL, reverse_sql=CIAL_REVERSE_SQL),
        migrations.RunSQL(sql=ABC_FUNCTION_SQL, reverse_sql=ABC_REVERSE_SQL),
    ]
