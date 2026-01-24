from django.db import migrations

# Function: get_sales_type_wise
SALES_TYPE_WISE_FUNCTION_SQL = r"""
CREATE OR REPLACE FUNCTION public.get_sales_type_wise(
    p_company_id integer,
    p_from_date date,
    p_to_date date
)
RETURNS TABLE(
    o_sale_date date
    o_sale_type character varying,
    o_bill_from text,
    o_bill_to text,
    o_gross_sale numeric,
    o_nett_sale numeric,
    o_total_discount numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        st.sale_type,
        MIN(sl.bill_no) AS bill_from,
        MAX(sl.bill_no) AS bill_to,
        SUM(sl.gross)::Numeric AS gross_sale,
        SUM(sl.bill_amount)::Numeric AS nett_sale,
        SUM(
            (
                (si.quantity * si.rate * si.exchange_rate)
                * (si.discount_p / 100)
            )
            + si.allocated_bill_discount
        )::Numeric AS total_discount
     FROM sales sl JOIN sale_types st ON st.sale_typeid = sl.type
                   JOIN sale_items si ON si.company_id = sl.company_id AND si.sale_id = sl.id
    WHERE sl.company_id = p_company_id AND sl.sale_date BETWEEN p_from_date AND p_to_date AND sl.cancel = 0
    GROUP BY sl.sale_date, st.sale_type
    ORDER BY sl.sale_date, st.sale_type;
END;
$$;
"""

SALES_TYPE_WISE_REVERSE_SQL = r"""
DROP FUNCTION IF EXISTS public.get_sales_type_wise(integer, date, date);
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0019_add_publisher_author_wise_sales_function'),
    ]

    operations = [
        migrations.RunSQL(
            sql=SALES_TYPE_WISE_FUNCTION_SQL,
            reverse_sql=SALES_TYPE_WISE_REVERSE_SQL,
        ),
    ]
