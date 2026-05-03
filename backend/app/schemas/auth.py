from pydantic import BaseModel, Field


class LoginInput(BaseModel):
    email: str = Field(
        ...,
        description="E-mail do admin/aluno ou matrícula do aluno.",
        examples=["admin@portal.local", "arthur.sandrini@portal.local", "20241si017"],
    )
    senha: str = Field(..., description="Senha cadastrada para o usuário.", examples=["admin123"])


class TokenOutput(BaseModel):
    access_token: str = Field(..., description="Token JWT usado no cabeçalho Authorization.")
    token_type: str = Field("bearer", description="Tipo do token retornado.")
    tipo: str = Field(..., description='"admin" ou "aluno"; usado pelo frontend para redirecionar.')


class MeOutput(BaseModel):
    id:    int = Field(..., description="Identificador do usuário autenticado.")
    nome:  str = Field(..., description="Nome do usuário autenticado.")
    email: str = Field(..., description="E-mail do usuário autenticado.")
    tipo:  str = Field(..., description='"admin" ou "aluno".')

    model_config = {"from_attributes": True}
