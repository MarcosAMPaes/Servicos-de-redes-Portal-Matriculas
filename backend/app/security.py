"""
Autenticação e autorização via JWT (JSON Web Token).

Fluxo:
  1. Cliente envia POST /api/auth/login com email + senha
  2. Backend valida credenciais e chama criar_token()
  3. Token é retornado ao cliente (Bearer token)
  4. Cliente envia o token em cada requisição:
       Authorization: Bearer <token>
  5. FastAPI injeta get_current_user() nas rotas protegidas,
     que decodifica o token e retorna o usuário

Dependências de autorização:
  - get_current_user → qualquer usuário autenticado
  - require_admin    → somente administradores
  - require_aluno    → somente alunos
"""
import os
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from . import models
from .database import get_db

JWT_SECRET_KEY      = os.getenv("JWT_SECRET_KEY", "chave-insegura-trocar-em-producao")
JWT_ALGORITHM       = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "120"))

# HTTPBearer lê o header: Authorization: Bearer <token>
bearer_scheme = HTTPBearer()


def criar_token(data: dict) -> str:
    """
    Gera um JWT assinado com o payload informado.
    Adiciona automaticamente a expiração (`exp`).
    """
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=JWT_EXPIRES_MINUTES)
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> dict:
    """
    Dependência central de autenticação.
    Decodifica o JWT, valida assinatura e expiração,
    e retorna {"tipo": "admin"|"aluno", "user": <objeto ORM>}.
    """
    token = credentials.credentials
    erro_401 = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        tipo:  str = payload.get("tipo")
        if not email or not tipo:
            raise erro_401
    except JWTError:
        raise erro_401

    if tipo == "admin":
        user = db.query(models.Administrador).filter(
            models.Administrador.email == email,
            models.Administrador.ativo == True,
        ).first()
    else:
        user = db.query(models.Aluno).filter(
            models.Aluno.email == email,
            models.Aluno.ativo == True,
        ).first()

    if user is None:
        raise erro_401

    return {"tipo": tipo, "user": user}


def require_admin(current: dict = Depends(get_current_user)) -> dict:
    """Dependência: bloqueia acesso de não-administradores com HTTP 403."""
    if current["tipo"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores.",
        )
    return current


def require_aluno(current: dict = Depends(get_current_user)) -> dict:
    """Dependência: bloqueia acesso de não-alunos com HTTP 403."""
    if current["tipo"] != "aluno":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a alunos autenticados.",
        )
    return current
