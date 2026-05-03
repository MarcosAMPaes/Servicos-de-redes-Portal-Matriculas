from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models
from ..database import get_db
from ..security import require_admin
from ..schemas.cursos import CursoCreate, CursoUpdate, CursoOut
from ..schemas.alunos import AlunoOut

router = APIRouter(prefix="/cursos", tags=["Cursos"])


@router.get("", response_model=List[CursoOut])
def listar_cursos(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    return db.query(models.Curso).order_by(models.Curso.id).all()


@router.post("", response_model=CursoOut, status_code=status.HTTP_201_CREATED)
def criar_curso(
    payload: CursoCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    curso = models.Curso(**payload.model_dump())
    db.add(curso)
    db.commit()
    db.refresh(curso)
    return curso


@router.get("/{curso_id}", response_model=CursoOut)
def obter_curso(
    curso_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    curso = db.query(models.Curso).filter(models.Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso não encontrado.")
    return curso


@router.put("/{curso_id}", response_model=CursoOut)
def atualizar_curso(
    curso_id: int,
    payload: CursoUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    curso = db.query(models.Curso).filter(models.Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso não encontrado.")

    for campo, valor in payload.model_dump(exclude_none=True).items():
        setattr(curso, campo, valor)

    db.commit()
    db.refresh(curso)
    return curso


@router.delete("/{curso_id}", status_code=status.HTTP_204_NO_CONTENT)
def desativar_curso(
    curso_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    curso = db.query(models.Curso).filter(models.Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso não encontrado.")
    curso.ativo = False
    db.commit()


@router.get("/{curso_id}/alunos", response_model=List[AlunoOut])
def alunos_do_curso(
    curso_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    curso = db.query(models.Curso).filter(models.Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso não encontrado.")
    return [m.aluno for m in curso.matriculas if m.status != "cancelada"]
