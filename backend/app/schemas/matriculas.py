from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from .alunos import AlunoOut
from .cursos import CursoOut


class MatriculaCreate(BaseModel):
    aluno_id:      int = Field(..., description="ID do aluno que será matriculado.", examples=[1])
    curso_id:      int = Field(..., description="ID do curso escolhido.", examples=[1])
    status:        str = Field("ativa", description="Status inicial da matrícula.", examples=["ativa"])
    data_matricula: Optional[date] = Field(None, description="Data da matrícula. Se não enviada, a API usa a data atual.")


class MatriculaUpdate(BaseModel):
    status:         Optional[str]  = Field(None, description="Novo status: ativa, trancada, concluida ou cancelada.")
    data_matricula: Optional[date] = Field(None, description="Nova data de matrícula.")


class MatriculaOut(BaseModel):
    id:             int = Field(..., description="Identificador interno da matrícula.")
    aluno_id:       int = Field(..., description="ID do aluno vinculado.")
    curso_id:       int = Field(..., description="ID do curso vinculado.")
    status:         str = Field(..., description="Status atual da matrícula.")
    data_matricula: Optional[date]     = Field(None, description="Data em que a matrícula foi registrada.")
    criado_em:      datetime = Field(..., description="Data e hora de criação do registro.")

    model_config = ConfigDict(from_attributes=True)


class MatriculaDetalhada(BaseModel):
    id:             int = Field(..., description="Identificador interno da matrícula.")
    aluno_id:       int = Field(..., description="ID do aluno vinculado.")
    curso_id:       int = Field(..., description="ID do curso vinculado.")
    status:         str = Field(..., description="Status atual da matrícula.")
    data_matricula: Optional[date]     = Field(None, description="Data em que a matrícula foi registrada.")
    criado_em:      datetime = Field(..., description="Data e hora de criação do registro.")
    aluno:          AlunoOut = Field(..., description="Dados completos do aluno vinculado.")
    curso:          CursoOut = Field(..., description="Dados completos do curso vinculado.")

    model_config = ConfigDict(from_attributes=True)
