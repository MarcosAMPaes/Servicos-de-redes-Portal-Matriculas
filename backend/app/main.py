"""
Ponto de entrada da aplicação FastAPI.

O que acontece ao iniciar:
  1. lifespan cria as tabelas no PostgreSQL (se não existirem)
  2. lifespan executa o seed de dados iniciais
  3. FastAPI registra todos os roteadores sob o prefixo /api
  4. Uvicorn começa a atender requisições na porta 8080

Documentação automática (acessível enquanto o backend estiver rodando):
  http://localhost/api/docs    → Swagger UI
  http://localhost/api/redoc   → ReDoc
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base, SessionLocal
from .seed import popular_banco
from .routes import auth, alunos, cursos, matriculas


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Contexto de vida da aplicação.
    Tudo antes do `yield` roda no startup; depois do `yield`, no shutdown.
    """
    # Cria todas as tabelas definidas nos modelos (idempotente — ignora existentes)
    Base.metadata.create_all(bind=engine)

    # Popula dados iniciais de demonstração
    db = SessionLocal()
    try:
        popular_banco(db)
    finally:
        db.close()

    yield   # ← aplicação fica rodando aqui até ser encerrada


app = FastAPI(
    title="Portal de Matrículas — API",
    description=(
        "Backend do sistema de gestão acadêmica do Grupo 4.\n\n"
        "**Credenciais demo:**\n"
        "- Admin: `admin@portal.local` / `admin123`\n"
        "- Aluno: `arthur.sandrini@portal.local` / `aluno123`"
    ),
    version="1.0.0",
    # Todos os endpoints de doc também ficam sob /api
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────
# Quando frontend e API são servidos pelo mesmo NGINX, CORS não é necessário.
# Mantemos aqui para facilitar testes diretos ao FastAPI (ex: curl, Postman).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # False é compatível com allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Healthcheck ───────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
def health():
    """
    Verificação de saúde usada pelo Docker Compose (healthcheck)
    e pelo NGINX para aguardar o backend subir antes de servir tráfego.
    """
    return {"status": "ok"}


# ── Roteadores ────────────────────────────────────────────────────────────
# O prefixo /api faz cada rota responder como /api/auth/..., /api/alunos/...
# Isso é necessário porque o NGINX encaminha /api/ para o FastAPI.
app.include_router(auth.router,       prefix="/api")
app.include_router(alunos.router,     prefix="/api")
app.include_router(cursos.router,     prefix="/api")
app.include_router(matriculas.router, prefix="/api")
