from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CursoCreate(BaseModel):
    nome:          str
    sigla:         str
    carga_horaria: int
    descricao:     Optional[str]  = None
    ativo:         bool = True
    cor:           Optional[str]  = "blue"


class CursoUpdate(BaseModel):
    nome:          Optional[str]  = None
    sigla:         Optional[str]  = None
    carga_horaria: Optional[int]  = None
    descricao:     Optional[str]  = None
    ativo:         Optional[bool] = None
    cor:           Optional[str]  = None


class CursoOut(BaseModel):
    id:            int
    nome:          str
    sigla:         str
    carga_horaria: int
    descricao:     Optional[str]      = None
    ativo:         bool
    cor:           Optional[str]      = None
    criado_em:     datetime

    model_config = ConfigDict(from_attributes=True)
