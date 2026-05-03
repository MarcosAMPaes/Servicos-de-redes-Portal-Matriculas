from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base, SessionLocal
from .seed import popular_banco
from .routes import auth, alunos, cursos, matriculas


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        popular_banco(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="Portal de Matrículas - API",
    description=(
        "Backend do sistema de gestão acadêmica do Grupo 4.\n\n"
        "**Credenciais demo:**\n"
        "- Admin: `admin@portal.local` / `admin123`\n"
        "- Aluno: `arthur.sandrini@portal.local` / `aluno123`"
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api")
app.include_router(alunos.router, prefix="/api")
app.include_router(cursos.router, prefix="/api")
app.include_router(matriculas.router, prefix="/api")
