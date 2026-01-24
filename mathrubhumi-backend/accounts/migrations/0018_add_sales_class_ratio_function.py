from django.db import migrations

# Function: get_sales_class_ratio
SALES_CLASS_RATIO_FUNCTION_SQL = r"""
CREATE OR REPLACE FUNCTION public.get_sales_class_ratio(
    p_company_id integer,
    p_from_date date,
    p_to_date date
)
RETURNS TABLE(o_class_nm text, o_amount numeric)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN s.class = 0 THEN 'INDIVIDUAL'
            WHEN s.class = 1 THEN 'EDUCATIONAL INSTT- SCHOOL'
            WHEN s.class = 2 THEN 'EDUCATIONAL INSTT- COLLEGE'
            WHEN s.class = 3 THEN 'LOCAL LIBRARY'
            WHEN s.class = 4 THEN 'LOCAL BODY (PANCHAYAT, MUNCIPALITY etc)'
            WHEN s.class = 5 THEN 'COMMISSION AGENTS'
            WHEN s.class = 6 THEN 'AGENCY'
            WHEN s.class = 7 THEN 'OTHER BOOK SHOPS'
            WHEN s.class = 8 THEN 'CORPORATE FIRMS'
            WHEN s.class = 9 THEN 'OTHERS'
        END AS class_nm,
        SUM(s.bill_amount)::NUMERIC(10,2) AS amount
    FROM sales s
    WHERE s.company_id = p_company_id AND s.sale_date BETWEEN p_from_date AND p_to_date AND s.cancel = 0 AND s.type IN (0, 1, 7)
    GROUP BY s.class
    ORDER BY s.class;
END;
$$;
"""

SALES_CLASS_RATIO_REVERSE_SQL = r"""
DROP FUNCTION IF EXISTS public.get_sales_class_ratio(integer, date, date);
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0017_add_category_wise_sales_function'),
    ]

    operations = [
        migrations.RunSQL(
            sql=SALES_CLASS_RATIO_FUNCTION_SQL,
            reverse_sql=SALES_CLASS_RATIO_REVERSE_SQL,
        ),
    ]
