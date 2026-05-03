from pydantic import BaseModel


class LoginInput(BaseModel):
    email: str       # aceita e-mail ou matrícula
    senha: str


class TokenOutput(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tipo: str        # "admin" | "aluno" usado pelo frontend


class MeOutput(BaseModel):
    id:    int
    nome:  str
    email: str
    tipo:  str       # "admin" | "aluno"

    model_config = {"from_attributes": True}
