from datetime import date as _date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models
from ..database import get_db
from ..security import require_admin
from ..schemas.matriculas import (
    MatriculaCreate, MatriculaUpdate,
    MatriculaOut, MatriculaDetalhada,
)

router = APIRouter(prefix="/matriculas", tags=["🔗 Matrículas"])

STATUS_VALIDOS = {"ativa", "trancada", "concluida", "cancelada"}


@router.get(
    "",
    response_model=List[MatriculaDetalhada],
    summary="Listar matrículas",
    description="""
Lista todas as matrículas com dados completos de aluno e curso.

Rota restrita a administradores.
""",
    responses={403: {"description": "Acesso restrito a administradores."}},
)
def listar_matriculas(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    return db.query(models.Matricula).order_by(models.Matricula.id).all()


@router.post(
    "",
    response_model=MatriculaOut,
    status_code=status.HTTP_201_CREATED,
    summary="Criar matrícula",
    description="""
Cria o vínculo entre um aluno ativo e um curso ativo.

Regras aplicadas:

- `status` precisa ser um dos valores permitidos.
- O aluno precisa existir e estar ativo.
- O curso precisa existir e estar ativo.
- A combinação aluno + curso não pode estar duplicada.
""",
    responses={
        201: {"description": "Matrícula criada com sucesso."},
        400: {"description": "Status inválido."},
        403: {"description": "Acesso restrito a administradores."},
        404: {"description": "Aluno ou curso não encontrado/inativo."},
        409: {"description": "Aluno já matriculado neste curso."},
    },
)
def criar_matricula(
    payload: MatriculaCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    if payload.status not in STATUS_VALIDOS:
        raise HTTPException(status_code=400, detail=f"Status inválido. Use: {STATUS_VALIDOS}")

    aluno = db.query(models.Aluno).filter(
        models.Aluno.id == payload.aluno_id,
        models.Aluno.ativo == True,
    ).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado ou inativo.")

    curso = db.query(models.Curso).filter(
        models.Curso.id == payload.curso_id,
        models.Curso.ativo == True,
    ).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso não encontrado ou inativo.")

    duplicado = db.query(models.Matricula).filter(
        models.Matricula.aluno_id == payload.aluno_id,
        models.Matricula.curso_id == payload.curso_id,
    ).first()
    if duplicado:
        raise HTTPException(status_code=409, detail="Aluno já matriculado neste curso.")

    dados = payload.model_dump(exclude_none=True)
    if "data_matricula" not in dados:
        dados["data_matricula"] = _date.today()
    matricula = models.Matricula(**dados)
    db.add(matricula)
    db.commit()
    db.refresh(matricula)
    return matricula


@router.get(
    "/{matricula_id}",
    response_model=MatriculaDetalhada,
    summary="Buscar matrícula por ID",
    description="Retorna uma matrícula específica com os dados de aluno e curso embutidos.",
    responses={
        403: {"description": "Acesso restrito a administradores."},
        404: {"description": "Matrícula não encontrada."},
    },
)
def obter_matricula(
    matricula_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    m = db.query(models.Matricula).filter(models.Matricula.id == matricula_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Matrícula não encontrada.")
    return m


@router.put(
    "/{matricula_id}",
    response_model=MatriculaOut,
    summary="Atualizar matrícula",
    description="""
Atualiza o status e/ou a data de matrícula.

Status aceitos: `ativa`, `trancada`, `concluida`, `cancelada`.
""",
    responses={
        400: {"description": "Status inválido."},
        403: {"description": "Acesso restrito a administradores."},
        404: {"description": "Matrícula não encontrada."},
    },
)
def atualizar_matricula(
    matricula_id: int,
    payload: MatriculaUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    m = db.query(models.Matricula).filter(models.Matricula.id == matricula_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Matrícula não encontrada.")

    if payload.status and payload.status not in STATUS_VALIDOS:
        raise HTTPException(status_code=400, detail=f"Status inválido. Use: {STATUS_VALIDOS}")

    for campo, valor in payload.model_dump(exclude_none=True).items():
        setattr(m, campo, valor)

    db.commit()
    db.refresh(m)
    return m


@router.delete(
    "/{matricula_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancelar matrícula",
    description="""
Realiza exclusão lógica da matrícula.

O registro permanece no banco, mas o campo `status` passa para `cancelada`.
""",
    responses={
        204: {"description": "Matrícula cancelada com sucesso."},
        403: {"description": "Acesso restrito a administradores."},
        404: {"description": "Matrícula não encontrada."},
    },
)
def cancelar_matricula(
    matricula_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    m = db.query(models.Matricula).filter(models.Matricula.id == matricula_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Matrícula não encontrada.")
    m.status = "cancelada"
    db.commit()
