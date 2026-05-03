"""
Rotas de autenticação:
  POST /api/auth/login  → valida credenciais, retorna JWT
  GET  /api/auth/me     → retorna dados do usuário logado
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
from ..security import criar_token, get_current_user
from ..schemas.auth import LoginInput, TokenOutput, MeOutput

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=TokenOutput)
def login(payload: LoginInput, db: Session = Depends(get_db)):
    """
    Autentica admin ou aluno.
    Tenta admin primeiro; se não encontrar, tenta aluno.
    Aluno pode autenticar com e-mail ou número de matrícula.
    """
    # ── Tentativa admin ──────────────────────────────────────────
    admin = db.query(models.Administrador).filter(
        models.Administrador.email == payload.email,
        models.Administrador.senha == payload.senha,
        models.Administrador.ativo == True,
    ).first()
    if admin:
        token = criar_token({"sub": admin.email, "tipo": "admin", "id": admin.id})
        return {"access_token": token, "token_type": "bearer", "tipo": "admin"}

    # ── Tentativa aluno ───────────────────────────────────────────
    # or_() permite login com e-mail OU número de matrícula
    aluno = db.query(models.Aluno).filter(
        or_(
            models.Aluno.email == payload.email,
            models.Aluno.matricula == payload.email,
        ),
        models.Aluno.senha == payload.senha,
        models.Aluno.ativo == True,
    ).first()
    if aluno:
        token = criar_token({"sub": aluno.email, "tipo": "aluno", "id": aluno.id})
        return {"access_token": token, "token_type": "bearer", "tipo": "aluno"}

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas.",
    )


@router.get("/me", response_model=MeOutput)
def me(current: dict = Depends(get_current_user)):
    """Retorna os dados básicos do usuário autenticado."""
    user = current["user"]
    return {"id": user.id, "nome": user.nome, "email": user.email, "tipo": current["tipo"]}
