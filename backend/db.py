"""Database engine + session setup (SQLite by default)."""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///" + os.path.join(os.path.dirname(__file__), "devwell.db"),
)

_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
Base = declarative_base()


def init_db() -> None:
    """Create tables if they don't exist. Importing data.orm registers the models."""
    from data import orm  # noqa: F401
    Base.metadata.create_all(bind=engine)
