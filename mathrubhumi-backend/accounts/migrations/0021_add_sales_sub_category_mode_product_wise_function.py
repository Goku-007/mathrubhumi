from django.db import migrations

# Function: get_sales_sub_category_mode_product_wise
SALES_SUB_CATEGORY_MODE_PRODUCT_WISE_FUNCTION_SQL = r"""
CREATE OR REPLACE FUNCTION public.get_sales_sub_category_mode_product_wise(
    p_company_id integer,
    p_from_date date,
    p_to_date date
)
RETURNS TABLE(
    o_sub_category_nm character varying,
    o_mode character varying,
    o_title character varying,
    o_gross_sale numeric,
    o_nett_sale numeric,
    o_total_discount numeric,
    o_quantity integer
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
     SELECT sc.sub_category_nm,
            scm.sale_cash_mode,
            t.title,
            SUM(sl.gross)::Numeric AS gross_sale,
            SUM(sl.bill_amount)::Numeric AS nett_sale,
            SUM(
                (
                    (si.quantity * si.rate * si.exchange_rate)
                    * (si.discount_p / 100)
                )
                + si.allocated_bill_discount
            )::Numeric AS total_discount,
            SUM(si.quantity)::Integer AS quantity
      FROM sales sl JOIN sale_items si ON si.company_id = sl.company_id AND si.sale_id = sl.id
                    JOIN titles t ON si.title_id = t.id
                    JOIN sub_categories sc ON sc.id = t.sub_category_id
                    JOIN sale_cash_modes scm ON sl.MODE = scm.sale_cash_modeid
     WHERE sl.company_id = p_company_id AND sl.sale_date BETWEEN p_from_date AND p_to_date AND sl.cancel = 0
  GROUP BY sc.sub_category_nm, scm.sale_cash_mode, t.title;
END;
$$;
"""

SALES_SUB_CATEGORY_MODE_PRODUCT_WISE_REVERSE_SQL = r"""
DROP FUNCTION IF EXISTS public.get_sales_sub_category_mode_product_wise(integer, date, date);
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0020_add_sales_type_wise_function'),
    ]

    operations = [
        migrations.RunSQL(
            sql=SALES_SUB_CATEGORY_MODE_PRODUCT_WISE_FUNCTION_SQL,
            reverse_sql=SALES_SUB_CATEGORY_MODE_PRODUCT_WISE_REVERSE_SQL,
        ),
    ]
