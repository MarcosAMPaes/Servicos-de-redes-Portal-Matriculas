"""
Schemas Pydantic para matrículas.

MatriculaDetalhada inclui os objetos aninhados de aluno e curso,
usada na listagem para o frontend não precisar fazer N+1 requests.
"""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from .alunos import AlunoOut
from .cursos import CursoOut


class MatriculaCreate(BaseModel):
    aluno_id:      int
    curso_id:      int
    status:        str           = "ativa"
    data_matricula: Optional[date] = None


class MatriculaUpdate(BaseModel):
    status:         Optional[str]  = None
    data_matricula: Optional[date] = None


class MatriculaOut(BaseModel):
    id:             int
    aluno_id:       int
    curso_id:       int
    status:         str
    data_matricula: Optional[date]     = None
    criado_em:      datetime

    model_config = ConfigDict(from_attributes=True)


class MatriculaDetalhada(BaseModel):
    """Versão completa com aluno e curso embutidos (evita N+1 no frontend)."""
    id:             int
    aluno_id:       int
    curso_id:       int
    status:         str
    data_matricula: Optional[date]     = None
    criado_em:      datetime
    aluno:          AlunoOut
    curso:          CursoOut

    model_config = ConfigDict(from_attributes=True)
