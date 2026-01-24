from django.db import migrations

# Function: get_category_publisher_author_wise_sales
CATEGORY_PUBLISHER_AUTHOR_WISE_SALES_FUNCTION_SQL = r"""
CREATE OR REPLACE FUNCTION public.get_category_publisher_author_wise_sales(
    p_company_id integer,
    p_from_date date,
    p_to_date date
)
RETURNS TABLE(
    o_sub_category_nm character varying,
    o_publisher_nm character varying,
    o_author_nm character varying,
    o_title character varying,
    o_quantity integer,
    o_value numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT sc.sub_category_nm, p.publisher_nm, a.author_nm, t.title, SUM(si.quantity)::INT4, SUM(si.line_value)
        FROM sale_items si JOIN sales sl ON sl.company_id = si.company_id AND sl.id = si.sale_id
                           JOIN titles t ON si.title_id = t.id
                           JOIN publishers p ON t.publisher_id = p.id
                           JOIN authors a ON t.author_id = a.id
                           JOIN sub_categories sc ON t.sub_category_id = sc.id
       WHERE sl.company_id = p_company_id AND sl.sale_date BETWEEN p_from_date AND p_to_date AND cancel = 0
    GROUP BY sc.sub_category_nm, p.publisher_nm, a.author_nm, t.title;
END;
$$;
"""

CATEGORY_PUBLISHER_AUTHOR_WISE_SALES_REVERSE_SQL = r"""
DROP FUNCTION IF EXISTS public.get_category_publisher_author_wise_sales(integer, date, date);
"""


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0015_add_purchase_columns_to_sale_rt_items'),
    ]

    operations = [
        migrations.RunSQL(
            sql=CATEGORY_PUBLISHER_AUTHOR_WISE_SALES_FUNCTION_SQL,
            reverse_sql=CATEGORY_PUBLISHER_AUTHOR_WISE_SALES_REVERSE_SQL,
        ),
    ]
