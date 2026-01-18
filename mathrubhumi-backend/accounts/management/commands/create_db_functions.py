"""
Management command to ensure database functions exist.
This can be run independently to fix missing functions.
"""
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Create database functions if they do not exist'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Create get_abc_sales_register function
            self.stdout.write('Creating get_abc_sales_register function...')
            cursor.execute("""
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
            """)
            self.stdout.write(self.style.SUCCESS('Successfully created get_abc_sales_register function'))

            # Create get_cial_sales_register function
            self.stdout.write('Creating get_cial_sales_register function...')
            cursor.execute("""
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
            """)
            self.stdout.write(self.style.SUCCESS('Successfully created get_cial_sales_register function'))

            # Create get_sales_agent_wise function
            self.stdout.write('Creating get_sales_agent_wise function...')
            cursor.execute("""
                CREATE OR REPLACE FUNCTION public.get_sales_agent_wise(
                    p_company_id integer,
                    p_from_date date,
                    p_to_date date
                )
                RETURNS TABLE(o_agent character varying, o_sale_date date, o_sale_type character varying, o_gross_sale numeric, o_nett_sale numeric, o_total_discount numeric)
                LANGUAGE plpgsql
                AS $$
                BEGIN
                    RETURN QUERY
                    SELECT
                        a.agent_nm,
                        sl.sale_date,
                        st.sale_type,
                        SUM(sl.gross)::Numeric AS gross_sale,
                        SUM(sl.bill_amount)::Numeric AS nett_sale,
                        SUM(
                            (
                                (si.quantity * si.rate * si.exchange_rate) 
                                * (si.discount_p / 100)
                            ) 
                            + si.allocated_bill_discount
                        )::Numeric AS total_discount
                     FROM sales sl 
                     JOIN sale_types st ON st.sale_typeid = sl.type
                     JOIN sale_items si ON si.company_id = sl.company_id AND si.sale_id = sl.id
                     JOIN agents a ON sl.agent_id = a.id
                    WHERE sl.company_id = p_company_id 
                      AND sl.sale_date BETWEEN p_from_date AND p_to_date 
                      AND sl.cancel = 0
                    GROUP BY a.agent_nm, sl.sale_date, st.sale_type
                    ORDER BY a.agent_nm, sl.sale_date, st.sale_type;
                END;
                $$;
            """)
            self.stdout.write(self.style.SUCCESS('Successfully created get_sales_agent_wise function'))

            self.stdout.write(self.style.SUCCESS('\nAll functions created successfully!'))
