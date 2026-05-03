"""
Schemas Pydantic para autenticação.

LoginInput  → corpo do POST /api/auth/login
TokenOutput → resposta com o JWT
MeOutput    → resposta do GET /api/auth/me
"""
from pydantic import BaseModel


class LoginInput(BaseModel):
    email: str   # aceita e-mail ou número de matrícula (validado na rota)
    senha: str


class TokenOutput(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tipo: str        # "admin" | "aluno" — usado pelo frontend para redirecionar


class MeOutput(BaseModel):
    id:    int
    nome:  str
    email: str
    tipo:  str       # "admin" | "aluno"

    model_config = {"from_attributes": True}
