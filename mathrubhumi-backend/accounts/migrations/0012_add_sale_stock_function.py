from django.db import migrations

# Function: get_sale_stock
SALE_STOCK_FUNCTION_SQL = r"""
CREATE OR REPLACE FUNCTION public.get_sale_stock(
    p_company_id integer,
    p_from_date date,
    p_to_date date
)
RETURNS TABLE(o_publisher_nm character varying, o_title character varying, o_sold_quantity integer, o_stock integer)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.publisher_nm, 
        t.title, 
        SUM(si.quantity)::INT4 AS sold_quantity, 
        t.stock::INT4
    FROM sale_items si 
    JOIN sales sl ON sl.company_id = si.company_id AND sl.id = si.sale_id 
    JOIN titles t ON si.title_id = t.id
    JOIN publishers p ON t.publisher_id = p.id 
    WHERE sl.company_id = p_company_id 
      AND sl.sale_date BETWEEN p_from_date AND p_to_date 
      AND sl.cancel = 0
    GROUP BY p.publisher_nm, t.title, t.stock
    ORDER BY sold_quantity DESC;
END;
$$;
"""

SALE_STOCK_REVERSE_SQL = r"""
DROP FUNCTION IF EXISTS public.get_sale_stock(integer, date, date);
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0011_add_sales_agent_wise_function'),
    ]

    operations = [
        migrations.RunSQL(sql=SALE_STOCK_FUNCTION_SQL, reverse_sql=SALE_STOCK_REVERSE_SQL),
    ]
