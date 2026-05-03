# ── Imagem base ──────────────────────────────────────────────────
# python:3.12-slim mantém a imagem pequena (sem ferramentas desnecessárias)
FROM python:3.12-slim

WORKDIR /app

# ── Dependências do sistema e Python ──────────────────────────────
# curl é necessário para o healthcheck declarado no docker-compose
COPY requirements.txt .
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir -r requirements.txt

# ── Código da aplicação ───────────────────────────────────────────
# O volume no docker-compose sobrescreve essa cópia em desenvolvimento,
# mas a mantemos aqui para que a imagem seja autocontida em produção.
COPY app/ ./app/

# ── Inicialização ─────────────────────────────────────────────────
# --host 0.0.0.0  → escuta em todas as interfaces (necessário no container)
# --port 8080     → porta interna (NGINX proxy_pass aponta aqui)
# --reload        → reinicia automaticamente quando o código muda (dev)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]
