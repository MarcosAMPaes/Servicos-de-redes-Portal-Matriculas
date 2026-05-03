import os
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from . import models
from .database import get_db

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "chave-insegura-trocar-em-producao")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "120"))

bearer_scheme = HTTPBearer()


def criar_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=JWT_EXPIRES_MINUTES)
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> dict:
    token = credentials.credentials
    erro_401 = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        tipo: str = payload.get("tipo")
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
    if current["tipo"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores.",
        )
    return current


def require_aluno(current: dict = Depends(get_current_user)) -> dict:
    if current["tipo"] != "aluno":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a alunos autenticados.",
        )
    return current
