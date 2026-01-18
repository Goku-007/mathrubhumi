from django.db import migrations

# Function: get_author_wise_title_sales
AUTHOR_WISE_TITLE_SALES_FUNCTION_SQL = r"""
CREATE OR REPLACE FUNCTION public.get_author_wise_title_sales(
    p_company_id integer,
    p_from_date date,
    p_to_date date,
    p_author_id integer
)
RETURNS TABLE(o_title character varying, o_rate numeric, o_quantity integer)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT t.title, si.rate, SUM(si.quantity)::INT4 AS quantity
        FROM sale_items si JOIN sales sl ON sl.company_id = si.company_id AND sl.id = si.sale_id 
                           JOIN titles t ON si.title_id = t.id
       WHERE sl.company_id = p_company_id AND sl.sale_date BETWEEN p_from_date AND p_to_date AND sl."type" IN (0, 1, 7) AND t.author_id = p_author_id 
         AND cancel = 0
    GROUP BY t.title, si.rate
    ORDER BY t.title, si.rate DESC;
END;
$$;
"""

AUTHOR_WISE_TITLE_SALES_REVERSE_SQL = r"""
DROP FUNCTION IF EXISTS public.get_author_wise_title_sales(integer, date, date, integer);
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0013_add_author_publisher_wise_sales_function'),
    ]

    operations = [
        migrations.RunSQL(sql=AUTHOR_WISE_TITLE_SALES_FUNCTION_SQL, reverse_sql=AUTHOR_WISE_TITLE_SALES_REVERSE_SQL),
    ]
