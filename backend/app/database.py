import os
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()


def _read_secret(path: str | None) -> str | None:
    if not path:
        return None
    try:
        with open(path, "r", encoding="utf-8") as secret_file:
            return secret_file.read().strip()
    except OSError:
        return None


def _build_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    user = os.getenv("POSTGRES_USER", "postgres")
    password = (
        os.getenv("POSTGRES_PASSWORD")
        or _read_secret(os.getenv("POSTGRES_PASSWORD_FILE"))
        or _read_secret(os.getenv("DATABASE_PASSWORD_FILE"))
    )
    host = os.getenv("POSTGRES_HOST", "postgres")
    port = os.getenv("POSTGRES_PORT", "5432")
    database = os.getenv("POSTGRES_DB", "portal_matriculas")

    if not password:
        raise RuntimeError(
            "Defina DATABASE_URL, POSTGRES_PASSWORD ou POSTGRES_PASSWORD_FILE."
        )

    return (
        "postgresql+psycopg2://"
        f"{quote_plus(user)}:{quote_plus(password)}@{host}:{port}/{database}"
    )


DATABASE_URL = _build_database_url()

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
