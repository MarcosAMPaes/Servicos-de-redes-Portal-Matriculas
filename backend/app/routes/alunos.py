"""
CRUD de alunos.

Regras de acesso:
  Admin  → todas as rotas
  Aluno  → apenas /me, /me/cursos e /me/matriculas (seus próprios dados)

Exclusão lógica: DELETE seta ativo=False, não remove do banco.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models
from ..database import get_db
from ..security import require_admin, require_aluno
from ..schemas.alunos import AlunoCreate, AlunoUpdate, AlunoOut
from ..schemas.cursos import CursoOut
from ..schemas.matriculas import MatriculaDetalhada

router = APIRouter(prefix="/alunos", tags=["Alunos"])

CORES = ["blue", "green", "peach", "lilac", "rose"]


# ── Rotas do próprio aluno ──────────────────────────────────────────────────
# Devem vir ANTES de /{aluno_id} para não serem capturadas como parâmetro

@router.get("/me", response_model=AlunoOut)
def meus_dados(current: dict = Depends(require_aluno)):
    """Retorna os dados do aluno que está logado."""
    return current["user"]


@router.get("/me/cursos", response_model=List[CursoOut])
def meus_cursos(
    current: dict = Depends(require_aluno),
    db: Session = Depends(get_db),
):
    """
    Lista somente os cursos em que o aluno logado está matriculado.
    Exclui matrículas canceladas do resultado.
    """
    aluno: models.Aluno = current["user"]
    return (
        db.query(models.Curso)
        .join(models.Matricula, models.Matricula.curso_id == models.Curso.id)
        .filter(
            models.Matricula.aluno_id == aluno.id,
            models.Matricula.status != "cancelada",
        )
        .all()
    )


@router.get("/me/matriculas", response_model=List[MatriculaDetalhada])
def minhas_matriculas(
    current: dict = Depends(require_aluno),
    db: Session = Depends(get_db),
):
    """
    Lista todas as matrículas do aluno logado, com dados completos
    de aluno e curso aninhados (evita N+1 no frontend).
    """
    aluno: models.Aluno = current["user"]
    return (
        db.query(models.Matricula)
        .filter(models.Matricula.aluno_id == aluno.id)
        .order_by(models.Matricula.id)
        .all()
    )


# ── Rotas administrativas ───────────────────────────────────────────────────

@router.get("", response_model=List[AlunoOut])
def listar_alunos(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Lista todos os alunos (ativos e inativos)."""
    return db.query(models.Aluno).order_by(models.Aluno.id).all()


@router.post("", response_model=AlunoOut, status_code=status.HTTP_201_CREATED)
def criar_aluno(
    payload: AlunoCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Cria um novo aluno.
    Garante unicidade de e-mail e matrícula antes de inserir.
    """
    if db.query(models.Aluno).filter(models.Aluno.email == payload.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    if db.query(models.Aluno).filter(models.Aluno.matricula == payload.matricula).first():
        raise HTTPException(status_code=400, detail="Matrícula já cadastrada.")

    if not payload.cor:
        total = db.query(models.Aluno).count()
        payload.cor = CORES[total % len(CORES)]

    aluno = models.Aluno(**payload.model_dump())
    db.add(aluno)
    db.commit()
    db.refresh(aluno)
    return aluno


@router.get("/{aluno_id}", response_model=AlunoOut)
def obter_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Retorna um aluno pelo ID."""
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")
    return aluno


@router.put("/{aluno_id}", response_model=AlunoOut)
def atualizar_aluno(
    aluno_id: int,
    payload: AlunoUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Atualiza um aluno. Apenas os campos enviados são alterados.
    Retorna HTTP 400 se e-mail ou matrícula já existirem em outro aluno.
    """
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")

    dados = payload.model_dump(exclude_none=True)

    if "email" in dados and dados["email"] != aluno.email:
        if db.query(models.Aluno).filter(models.Aluno.email == dados["email"]).first():
            raise HTTPException(status_code=400, detail="E-mail já cadastrado para outro aluno.")

    if "matricula" in dados and dados["matricula"] != aluno.matricula:
        if db.query(models.Aluno).filter(models.Aluno.matricula == dados["matricula"]).first():
            raise HTTPException(status_code=400, detail="Matrícula já cadastrada para outro aluno.")

    for campo, valor in dados.items():
        setattr(aluno, campo, valor)

    db.commit()
    db.refresh(aluno)
    return aluno


@router.delete("/{aluno_id}", status_code=status.HTTP_204_NO_CONTENT)
def desativar_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Exclusão lógica: seta ativo=False.
    O histórico de matrículas é preservado para auditoria.
    """
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")
    aluno.ativo = False
    db.commit()


@router.get("/{aluno_id}/cursos", response_model=List[CursoOut])
def cursos_do_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Lista os cursos (não cancelados) de um aluno específico — visão admin."""
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")
    return [m.curso for m in aluno.matriculas if m.status != "cancelada"]
