from datetime import date, datetime
from sqlalchemy import (
    Boolean, Column, Date, DateTime,
    ForeignKey, Integer, String, UniqueConstraint,
)
from sqlalchemy.orm import relationship
from .database import Base


class Administrador(Base):
    __tablename__ = "administradores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    senha = Column(String, nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    matricula = Column(String, unique=True, nullable=False, index=True)
    data_nascimento = Column(Date, nullable=True)
    senha = Column(String, nullable=False)
    ativo = Column(Boolean, default=True)
    cor = Column(String, default="blue")
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    matriculas = relationship("Matricula", back_populates="aluno")


class Curso(Base):
    __tablename__ = "cursos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    sigla = Column(String(10), nullable=False)
    carga_horaria = Column(Integer, nullable=False)
    descricao = Column(String, nullable=True)
    ativo = Column(Boolean, default=True)
    cor = Column(String, default="blue")
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    matriculas = relationship("Matricula", back_populates="curso")


class Matricula(Base):
    __tablename__ = "matriculas"

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    curso_id = Column(Integer, ForeignKey("cursos.id"), nullable=False)
    status = Column(String, default="ativa")
    data_matricula = Column(Date, default=date.today)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("aluno_id", "curso_id", name="uq_aluno_curso"),
    )

    aluno = relationship("Aluno", back_populates="matriculas")
    curso = relationship("Curso", back_populates="matriculas")
