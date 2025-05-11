from databases import Database
from dotenv import load_dotenv

load_dotenv()

import os

DATABASE_URL = os.getenv("SUPABASE_DB_URL")
database = Database(DATABASE_URL)