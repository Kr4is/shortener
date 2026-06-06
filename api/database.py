import os
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is required", file=sys.stderr)
    sys.exit(1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> bool:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True
