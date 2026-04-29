import traceback
import traceback
import sys
from sqlalchemy import create_engine, text

try:
    print("Testing pure DB write...")
    engine = create_engine("postgresql://postgres.zmesydjuebztxjljcaql:Supabase_55@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require")
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print("SUCCESS! Raw SQL executed properly.")
except Exception as e:
    print("FAILED TO QUERY. TRACEBACK:")
    traceback.print_exc()

    print("FAILED TO QUERY. TRACEBACK:")
    traceback.print_exc()
