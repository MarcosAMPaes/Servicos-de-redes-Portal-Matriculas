from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CursoCreate(BaseModel):
    nome:          str = Field(..., description="Nome completo do curso.", examples=["Sistemas de Informação"])
    sigla:         str = Field(..., description="Sigla curta do curso.", examples=["SI"])
    carga_horaria: int = Field(..., description="Carga horária total do curso.", examples=[3200])
    descricao:     Optional[str]  = Field(None, description="Resumo do curso e seus objetivos.")
    ativo:         bool = Field(True, description="Indica se o curso está ativo.")
    cor:           Optional[str]  = Field("blue", description="Cor usada pelo frontend nos cards do curso.")


class CursoUpdate(BaseModel):
    nome:          Optional[str]  = Field(None, description="Novo nome do curso.")
    sigla:         Optional[str]  = Field(None, description="Nova sigla do curso.")
    carga_horaria: Optional[int]  = Field(None, description="Nova carga horária total.")
    descricao:     Optional[str]  = Field(None, description="Nova descrição.")
    ativo:         Optional[bool] = Field(None, description="Novo status ativo/inativo.")
    cor:           Optional[str]  = Field(None, description="Nova cor visual.")


class CursoOut(BaseModel):
    id:            int = Field(..., description="Identificador interno do curso.")
    nome:          str = Field(..., description="Nome completo do curso.")
    sigla:         str = Field(..., description="Sigla do curso.")
    carga_horaria: int = Field(..., description="Carga horária total.")
    descricao:     Optional[str]      = Field(None, description="Resumo do curso.")
    ativo:         bool = Field(..., description="Indica se o curso está ativo.")
    cor:           Optional[str]      = Field(None, description="Cor visual usada pelo frontend.")
    criado_em:     datetime = Field(..., description="Data e hora de criação do registro.")

    model_config = ConfigDict(from_attributes=True)
