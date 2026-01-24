from django.db import migrations

# Function: get_category_wise_sales
CATEGORY_WISE_SALES_FUNCTION_SQL = r"""
CREATE OR REPLACE FUNCTION public.get_category_wise_sales(
    p_company_id integer,
    p_from_date date,
    p_to_date date
)
RETURNS TABLE(
    o_sale_date date,
    o_category_nm character varying,
    o_discount_given numeric,
    o_tax_collected numeric,
    o_gross_sale numeric,
    o_nett_sale numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH item_calc AS (
        SELECT
            sl.sale_date,
            c.category_nm,
            (si.rate / (1 + si.tax/100)) * si.exchange_rate * si.quantity AS base_amount,
            si.discount_p,
            si.tax,
            sl.gross,
            sl.bill_amount
        FROM sales sl
        JOIN sale_items si ON si.company_id = sl.company_id AND si.sale_id = sl.id
        JOIN titles t ON si.title_id = t.id
        JOIN categories c ON c.id = t.category_id
       WHERE sl.company_id = p_company_id AND sl.sale_date BETWEEN p_from_date AND p_to_date AND sl.cancel = 0
    ),
    calc2 AS (
        SELECT
            sale_date,
            category_nm,
            gross,
            bill_amount,
            base_amount * (discount_p/100)                 AS discount_given,
            base_amount * (1 - discount_p/100) * (tax/100) AS tax_collected
        FROM item_calc
    )
    SELECT
        sale_date,
        category_nm,
        SUM(discount_given)::numeric     AS discount_given,
        SUM(tax_collected)::numeric      AS tax_collected,
        SUM(gross)::numeric              AS gross_sale,
        SUM(bill_amount)::numeric        AS nett_sale
    FROM calc2
    GROUP BY sale_date, category_nm
    ORDER BY sale_date, category_nm;
END;
$$;
"""

CATEGORY_WISE_SALES_REVERSE_SQL = r"""
DROP FUNCTION IF EXISTS public.get_category_wise_sales(integer, date, date);
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0016_add_category_publisher_author_wise_sales_function'),
    ]

    operations = [
        migrations.RunSQL(
            sql=CATEGORY_WISE_SALES_FUNCTION_SQL,
            reverse_sql=CATEGORY_WISE_SALES_REVERSE_SQL,
        ),
    ]
