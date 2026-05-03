"""
Schemas Pydantic para alunos.

AlunoCreate → POST /api/alunos (admin cria novo aluno)
AlunoUpdate → PUT  /api/alunos/{id} (campos opcionais — PATCH semântico)
AlunoOut    → resposta de qualquer rota que retorna um aluno
"""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AlunoCreate(BaseModel):
    nome:            str
    email:           str
    matricula:       str
    data_nascimento: Optional[date] = None
    senha:           str
    ativo:           bool = True
    cor:             Optional[str] = "blue"


class AlunoUpdate(BaseModel):
    """Todos os campos são opcionais — só os enviados são alterados."""
    nome:            Optional[str]  = None
    email:           Optional[str]  = None
    matricula:       Optional[str]  = None
    data_nascimento: Optional[date] = None
    senha:           Optional[str]  = None
    ativo:           Optional[bool] = None
    cor:             Optional[str]  = None


class AlunoOut(BaseModel):
    id:              int
    nome:            str
    email:           str
    matricula:       str
    data_nascimento: Optional[date]     = None
    ativo:           bool
    cor:             Optional[str]      = None
    criado_em:       datetime

    # from_attributes=True permite criar o schema a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)
