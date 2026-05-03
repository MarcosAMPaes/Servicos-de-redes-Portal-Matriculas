from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AlunoCreate(BaseModel):
    nome:            str = Field(..., description="Nome completo do aluno.", examples=["Arthur Sandrini"])
    email:           str = Field(..., description="E-mail institucional do aluno.", examples=["arthur.sandrini@portal.local"])
    matricula:       str = Field(..., description="Número único de matrícula.", examples=["20241si017"])
    data_nascimento: Optional[date] = Field(None, description="Data de nascimento no formato AAAA-MM-DD.", examples=["2003-04-12"])
    senha:           str = Field(..., description="Senha inicial do aluno.", examples=["aluno123"])
    ativo:           bool = Field(True, description="Indica se o aluno está ativo.")
    cor:             Optional[str] = Field("blue", description="Cor usada pelo frontend para avatar e detalhes visuais.")


class AlunoUpdate(BaseModel):
    nome:            Optional[str]  = Field(None, description="Novo nome completo.")
    email:           Optional[str]  = Field(None, description="Novo e-mail institucional.")
    matricula:       Optional[str]  = Field(None, description="Nova matrícula.")
    data_nascimento: Optional[date] = Field(None, description="Nova data de nascimento.")
    senha:           Optional[str]  = Field(None, description="Nova senha.")
    ativo:           Optional[bool] = Field(None, description="Novo status ativo/inativo.")
    cor:             Optional[str]  = Field(None, description="Nova cor visual.")


class AlunoOut(BaseModel):
    id:              int = Field(..., description="Identificador interno do aluno.")
    nome:            str = Field(..., description="Nome completo do aluno.")
    email:           str = Field(..., description="E-mail institucional do aluno.")
    matricula:       str = Field(..., description="Número de matrícula.")
    data_nascimento: Optional[date]     = Field(None, description="Data de nascimento.")
    ativo:           bool = Field(..., description="Indica se o aluno está ativo.")
    cor:             Optional[str]      = Field(None, description="Cor visual usada pelo frontend.")
    criado_em:       datetime = Field(..., description="Data e hora de criação do registro.")

    model_config = ConfigDict(from_attributes=True)
