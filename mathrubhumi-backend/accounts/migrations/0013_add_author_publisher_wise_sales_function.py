from django.db import migrations

# Function: get_author_publisher_wise_sales
AUTHOR_PUBLISHER_WISE_SALES_FUNCTION_SQL = r"""
CREATE OR REPLACE FUNCTION public.get_author_publisher_wise_sales(
    p_company_id integer,
    p_from_date date,
    p_to_date date
)
RETURNS TABLE(o_author_nm character varying, o_publisher_nm character varying, o_title character varying, o_quantity integer, o_value numeric)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT a.author_nm, p.publisher_nm, t.title, SUM(si.quantity)::INT4, SUM(si.line_value)
        FROM sale_items si JOIN sales sl ON sl.company_id = si.company_id AND sl.id = si.sale_id 
                           JOIN titles t ON si.title_id = t.id
                           JOIN publishers p ON t.publisher_id = p.id 
                           JOIN authors a ON t.author_id = a.id
       WHERE sl.company_id = p_company_id AND sl.sale_date BETWEEN p_from_date AND p_to_date AND cancel = 0                       
    GROUP BY a.author_nm, p.publisher_nm, t.title;
END;
$$;
"""

AUTHOR_PUBLISHER_WISE_SALES_REVERSE_SQL = r"""
DROP FUNCTION IF EXISTS public.get_author_publisher_wise_sales(integer, date, date);
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_add_sale_stock_function'),
    ]

    operations = [
        migrations.RunSQL(sql=AUTHOR_PUBLISHER_WISE_SALES_FUNCTION_SQL, reverse_sql=AUTHOR_PUBLISHER_WISE_SALES_REVERSE_SQL),
    ]
