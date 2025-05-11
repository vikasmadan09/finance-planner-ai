from databases import Database
from dotenv import load_dotenv

load_dotenv()

import os
print("DB URL is:", os.getenv("SUPABASE_DB_URL"))

DATABASE_URL = os.getenv("SUPABASE_DB_URL")
database = Database(DATABASE_URL)