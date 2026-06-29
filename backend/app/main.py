import asyncio
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from .database import engine, Base, SessionLocal
from .logger import send_loki_log, send_loki_log_async
from .seed import popular_banco
from .routes import auth, alunos, cursos, matriculas

OPENAPI_TAGS = [
    {
        "name": "💚 Saúde",
        "description": "Verificação rápida para saber se a API está online.",
    },
    {
        "name": "🔐 Autenticação",
        "description": "Login, emissão do token JWT e identificação do usuário autenticado.",
    },
    {
        "name": "👤 Área do Aluno",
        "description": "Rotas disponíveis para alunos autenticados consultarem seus próprios dados.",
    },
    {
        "name": "🎓 Alunos",
        "description": "CRUD administrativo de alunos, com exclusão lógica pelo campo `ativo`.",
    },
    {
        "name": "📚 Cursos",
        "description": "CRUD administrativo de cursos e consulta de alunos vinculados.",
    },
    {
        "name": "🔗 Matrículas",
        "description": "Gestão dos vínculos entre alunos e cursos, com cancelamento lógico.",
    },
]

API_DESCRIPTION = """
## 🎓 Portal de Matrículas

API do sistema acadêmico do **Grupo 4** para gerenciamento de alunos, cursos e matrículas.

### 🔐 Autenticação

As rotas protegidas usam **Bearer Token JWT**.

1. Faça login em `POST /api/auth/login`.
2. Copie o valor de `access_token`.
3. Clique em **Authorize** no Swagger.
4. Informe o token no formato:

```text
Bearer seu_token_aqui
```

### 👥 Perfis de acesso

| Perfil | Permissões |
|---|---|
| 🔐 Administrador | CRUD completo de alunos, cursos e matrículas |
| 👤 Aluno | Consulta apenas seus próprios dados, cursos e matrículas |

### 🧪 Credenciais demo

| Perfil | Login | Senha |
|---|---|---|
| Admin | `admin@portal.local` | `admin123` |
| Aluno | `arthur.sandrini@portal.local` ou `20241si017` | `aluno123` |

### 🗑️ Exclusão lógica

- Alunos e cursos não são removidos do banco: o campo `ativo` passa para `false`.
- Matrículas não são removidas: o campo `status` passa para `cancelada`.
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)

        db = SessionLocal()
        try:
            popular_banco(db)
        finally:
            db.close()
    except SQLAlchemyError as exc:
        send_loki_log(
            "postgres_connection_error",
            "Erro ao conectar ou inicializar o PostgreSQL.",
            level="error",
            retries=3,
            retry_delay=1.0,
            error_type=type(exc).__name__,
            error=str(exc),
        )
        raise

    send_loki_log(
        "startup",
        "Aplicacao FastAPI inicializada.",
        retries=10,
        retry_delay=1.0,
    )

    yield


app = FastAPI(
    title="🎓 Portal de Matrículas - API",
    description=API_DESCRIPTION,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    openapi_tags=OPENAPI_TAGS,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_http_requests(request, call_next):
    start = time.perf_counter()
    status_code = 500
    level = "info"
    error = None

    try:
        response = await call_next(request)
        status_code = response.status_code
        if status_code >= 500:
            level = "error"
        elif status_code >= 400:
            level = "warning"
        return response
    except Exception as exc:
        level = "error"
        error = f"{type(exc).__name__}: {exc}"
        raise
    finally:
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        asyncio.create_task(
            send_loki_log_async(
                "http_request",
                "Requisicao HTTP recebida.",
                level=level,
                method=request.method,
                route=request.url.path,
                status_code=status_code,
                duration_ms=duration_ms,
                client_ip=request.client.host if request.client else None,
                error=error,
            )
        )


@app.get(
    "/api/health",
    tags=["💚 Saúde"],
    summary="Verificar saúde da API",
    description="Retorna `status: ok` quando o backend FastAPI está respondendo.",
)
def health():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api")
app.include_router(alunos.router, prefix="/api")
app.include_router(cursos.router, prefix="/api")
app.include_router(matriculas.router, prefix="/api")
