from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models
from ..database import get_db
from ..security import require_admin, require_aluno
from ..schemas.alunos import AlunoCreate, AlunoUpdate, AlunoOut
from ..schemas.cursos import CursoOut
from ..schemas.matriculas import MatriculaDetalhada

router = APIRouter(prefix="/alunos")

CORES = ["blue", "green", "peach", "lilac", "rose"]



@router.get(
    "/me",
    response_model=AlunoOut,
    tags=["👤 Área do Aluno"],
    summary="Consultar meus dados",
    description="Retorna o cadastro completo do aluno autenticado pelo token JWT.",
    responses={401: {"description": "Token de aluno ausente, inválido ou expirado."}},
)
def meus_dados(current: dict = Depends(require_aluno)):
    return current["user"]


@router.get(
    "/me/cursos",
    response_model=List[CursoOut],
    tags=["👤 Área do Aluno"],
    summary="Listar meus cursos",
    description="""
Lista somente os cursos em que o aluno autenticado está matriculado.

Matrículas com status `cancelada` não aparecem no resultado.
""",
    responses={401: {"description": "Token de aluno ausente, inválido ou expirado."}},
)
def meus_cursos(
    current: dict = Depends(require_aluno),
    db: Session = Depends(get_db),
):
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


@router.get(
    "/me/matriculas",
    response_model=List[MatriculaDetalhada],
    tags=["👤 Área do Aluno"],
    summary="Listar minhas matrículas",
    description="""
Lista as matrículas do aluno autenticado com os dados do aluno e do curso embutidos.

Esta rota é usada pelo frontend para montar a área do aluno sem consultar outros endpoints.
""",
    responses={401: {"description": "Token de aluno ausente, inválido ou expirado."}},
)
def minhas_matriculas(
    current: dict = Depends(require_aluno),
    db: Session = Depends(get_db),
):
    aluno: models.Aluno = current["user"]
    return (
        db.query(models.Matricula)
        .filter(models.Matricula.aluno_id == aluno.id)
        .order_by(models.Matricula.id)
        .all()
    )



@router.get(
    "",
    response_model=List[AlunoOut],
    tags=["🎓 Alunos"],
    summary="Listar alunos",
    description="""
Lista todos os alunos cadastrados, incluindo ativos e inativos.

Rota restrita a administradores.
""",
    responses={403: {"description": "Acesso restrito a administradores."}},
)
def listar_alunos(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    return db.query(models.Aluno).order_by(models.Aluno.id).all()


@router.post(
    "",
    response_model=AlunoOut,
    status_code=status.HTTP_201_CREATED,
    tags=["🎓 Alunos"],
    summary="Cadastrar aluno",
    description="""
Cria um aluno com nome, e-mail, matrícula, senha inicial e dados opcionais.

O e-mail e a matrícula precisam ser únicos.
""",
    responses={
        201: {"description": "Aluno criado com sucesso."},
        400: {"description": "E-mail ou matrícula já cadastrados."},
        403: {"description": "Acesso restrito a administradores."},
    },
)
def criar_aluno(
    payload: AlunoCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
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


@router.get(
    "/{aluno_id}",
    response_model=AlunoOut,
    tags=["🎓 Alunos"],
    summary="Buscar aluno por ID",
    description="Retorna os dados de um aluno específico. Rota restrita a administradores.",
    responses={
        403: {"description": "Acesso restrito a administradores."},
        404: {"description": "Aluno não encontrado."},
    },
)
def obter_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")
    return aluno


@router.put(
    "/{aluno_id}",
    response_model=AlunoOut,
    tags=["🎓 Alunos"],
    summary="Atualizar aluno",
    description="""
Atualiza parcialmente os dados de um aluno.

Envie apenas os campos que devem ser alterados. Caso e-mail ou matrícula sejam alterados, a API valida se continuam únicos.
""",
    responses={
        400: {"description": "E-mail ou matrícula já cadastrados para outro aluno."},
        403: {"description": "Acesso restrito a administradores."},
        404: {"description": "Aluno não encontrado."},
    },
)
def atualizar_aluno(
    aluno_id: int,
    payload: AlunoUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
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


@router.delete(
    "/{aluno_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["🎓 Alunos"],
    summary="Desativar aluno",
    description="""
Realiza exclusão lógica do aluno.

O registro permanece no banco, mas o campo `ativo` passa para `false`.
""",
    responses={
        204: {"description": "Aluno desativado com sucesso."},
        403: {"description": "Acesso restrito a administradores."},
        404: {"description": "Aluno não encontrado."},
    },
)
def desativar_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")
    aluno.ativo = False
    db.commit()


@router.get(
    "/{aluno_id}/cursos",
    response_model=List[CursoOut],
    tags=["🎓 Alunos"],
    summary="Listar cursos de um aluno",
    description="""
Lista os cursos não cancelados vinculados a um aluno específico.

Esta é uma visão administrativa; alunos usam `GET /api/alunos/me/cursos`.
""",
    responses={
        403: {"description": "Acesso restrito a administradores."},
        404: {"description": "Aluno não encontrado."},
    },
)
def cursos_do_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")
    return [m.curso for m in aluno.matriculas if m.status != "cancelada"]
