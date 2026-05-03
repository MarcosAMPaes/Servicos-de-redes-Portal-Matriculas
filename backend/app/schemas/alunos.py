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

    model_config = ConfigDict(from_attributes=True)
