"""
Camada de conexão com o PostgreSQL.

SQLAlchemy é usado como ORM (Object-Relational Mapper):
  - engine: representa a conexão física com o banco
  - SessionLocal: fábrica de sessões (uma por requisição HTTP)
  - Base: classe base para todos os modelos ORM
  - get_db: dependência FastAPI que abre/fecha a sessão automaticamente
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# DATABASE_URL vem do .env, ex: postgresql+psycopg2://user:senha@host:5432/db
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

# autocommit=False → controlamos os commits manualmente (mais seguro)
# autoflush=False  → evita flushes intermediários inesperados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependência injetada nas rotas pelo FastAPI.
    Garante que a sessão seja fechada ao final de cada requisição,
    mesmo que ocorra uma exceção.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
