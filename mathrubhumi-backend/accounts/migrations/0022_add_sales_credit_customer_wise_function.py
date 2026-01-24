from django.db import migrations

# Function: get_sales_credit_customer_wise
SALES_CREDIT_CUSTOMER_WISE_FUNCTION_SQL = r"""
CREATE OR REPLACE FUNCTION public.get_sales_credit_customer_wise(
    p_company_id integer,
    p_from_date date,
    p_to_date date,
    p_cr_customer_id integer
)
RETURNS TABLE(
    o_credit_customer character varying,
    o_sale_date date,
    o_bill_no character varying,
    o_gross_sale numeric,
    o_nett_sale numeric,
    o_total_discount numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
        SELECT
            cc.customer_nm,
            sl.sale_date,
            sl.bill_no,
            SUM(sl.gross)::Numeric AS gross_sale,
            SUM(sl.bill_amount)::Numeric AS nett_sale,
            SUM(
                (
                    (si.quantity * si.rate * si.exchange_rate)
                    * (si.discount_p / 100)
                )
                + si.allocated_bill_discount
            )::Numeric AS total_discount
         FROM sales sl JOIN sale_items si ON si.company_id = sl.company_id AND si.sale_id = sl.id
                       JOIN cr_customers cc ON sl.cr_customer_id = cc.id
        WHERE sl.company_id = p_company_id AND sl.cr_customer_id = p_cr_customer_id AND sl.sale_date BETWEEN p_from_date AND p_to_date
          AND sl.type = 0 AND sl.cancel = 0
        GROUP BY cc.customer_nm, sl.sale_date, sl.bill_no
        ORDER BY cc.customer_nm, sl.sale_date, sl.bill_no;
END;
$$;
"""

SALES_CREDIT_CUSTOMER_WISE_REVERSE_SQL = r"""
DROP FUNCTION IF EXISTS public.get_sales_credit_customer_wise(integer, date, date, integer);
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0021_add_sales_sub_category_mode_product_wise_function'),
    ]

    operations = [
        migrations.RunSQL(
            sql=SALES_CREDIT_CUSTOMER_WISE_FUNCTION_SQL,
            reverse_sql=SALES_CREDIT_CUSTOMER_WISE_REVERSE_SQL,
        ),
    ]
