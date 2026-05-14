# 🎓 Portal de Matrículas

Sistema acadêmico conteinerizado para gerenciamento de **alunos**, **cursos** e **matrículas**, desenvolvido como atividade prática da disciplina **Serviços de Redes para Internet** (Grupo 4).

A aplicação demonstra orquestração de containers com **Docker Compose**, integrando frontend SPA, API REST e banco de dados em uma topologia única, com **NGINX** como proxy reverso e ponto único de exposição ao host.

---

## 🧰 Tecnologias

### Backend
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-0.32-499848?style=for-the-badge&logo=gunicorn&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-CA2136?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-2.10-E92063?style=for-the-badge&logo=pydantic&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-python--jose-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Custom-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### Infraestrutura
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![NGINX](https://img.shields.io/badge/NGINX-1.27-009639?style=for-the-badge&logo=nginx&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)

---

## 👥 Integrantes

- **Arthur Sandrini**
- **Eduardo Pereira**
- **Marcos Paes**

**Tema do grupo:** Controle de Alunos e Cursos

---

## 🏗️ Arquitetura

A aplicação é composta por três containers em uma topologia conforme exigido pela atividade:

```text
                        ┌──────────────────────────┐
                        │        Hospedeiro        │
                        │      (porta 80 host)     │
                        └────────────┬─────────────┘
                                     │
                       ┌─────────────▼─────────────┐
                       │   nginx  (porta 8080)     │
                       │   • frontend estático /   │
                       │   • proxy reverso /api/   │
                       └─────────────┬─────────────┘
                                     │ rede: web
                       ┌─────────────▼─────────────┐
                       │  fastapi (porta 8080)     │
                       │  • API REST + JWT         │
                       │  • Swagger /api/docs      │
                       └─────────────┬─────────────┘
                                     │ rede: backend_db (interna)
                       ┌─────────────▼─────────────┐
                       │  postgres (porta 5432)    │
                       │  • volume postgres_data   │
                       └───────────────────────────┘
```

| Serviço     | Imagem base            | Porta interna | Exposto ao host | Rede(s)               |
|-------------|------------------------|---------------|-----------------|-----------------------|
| `nginx`     | `nginx:1.27-alpine`    | 8080          | ✅ `80:8080`     | `web`                 |
| `fastapi`   | `python:3.12-slim`     | 8080          | ❌              | `web`, `backend_db`   |
| `postgres`  | `postgres:16-alpine`   | 5432          | ❌              | `backend_db` (interna)|

> 🔒 Apenas o NGINX é acessível externamente. O backend e o banco se comunicam por redes Docker isoladas.

---

## 📁 Estrutura do projeto

```text
Serviços-de-redes-Portal-Matriculas/
├── docker-compose.yml           # Orquestração dos 3 serviços
├── .env / .env.example          # Variáveis de ambiente
├── README.md
├── LICENSE
│
├── backend/                     # API FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # Bootstrap FastAPI + OpenAPI
│       ├── database.py          # Engine e sessão SQLAlchemy
│       ├── models.py            # ORM: Administrador, Aluno, Curso, Matrícula
│       ├── security.py          # JWT e dependências de auth
│       ├── seed.py              # Carga inicial de dados
│       ├── routes/              # auth, alunos, cursos, matriculas
│       └── schemas/             # Modelos Pydantic
│
├── frontend/                    # SPA React + Vite
│   ├── Dockerfile               # Build Node + servir via NGINX
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/main.jsx
│   ├── app.jsx, shell.jsx, ui.jsx
│   ├── login.jsx, aluno.jsx
│   ├── admin-dashboard.jsx, admin-alunos.jsx,
│   ├── admin-cursos.jsx, admin-matriculas.jsx
│   ├── api.jsx, data.jsx
│   └── styles.css
│
├── nginx/
│   └── nginx.conf               # Servidor estático + proxy /api
│
└── docs/
    ├── infraestrutura.md        # Mapeamento técnico
    ├── instrucoes.md            # Enunciado da atividade
    └── topologia-docker-compose.png
```

---

## ⚙️ Configuração

### 1. Variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

| Variável               | Descrição                                          | Padrão sugerido                           |
|------------------------|----------------------------------------------------|-------------------------------------------|
| `PROJECT_NAME`         | Nome do projeto                                    | `Portal de Matriculas`                    |
| `POSTGRES_DB`          | Nome do banco de dados                             | `portal_matriculas`                       |
| `POSTGRES_USER`        | Usuário do PostgreSQL                              | `postgres`                                |
| `POSTGRES_PASSWORD`    | Senha do PostgreSQL (matrícula de um integrante)   | `20241si017`                              |
| `POSTGRES_HOST`        | Host do banco (nome do serviço Docker)             | `postgres`                                |
| `POSTGRES_PORT`        | Porta do banco                                     | `5432`                                    |
| `DATABASE_URL`         | URL completa de conexão SQLAlchemy                 | `postgresql+psycopg2://...`               |
| `JWT_SECRET_KEY`       | Chave para assinar tokens JWT                      | string aleatória longa                    |
| `JWT_ALGORITHM`        | Algoritmo JWT                                      | `HS256`                                   |
| `JWT_EXPIRES_MINUTES`  | Validade do token em minutos                       | `120`                                     |
| `BACKEND_HOST`         | Host interno do backend                            | `fastapi`                                 |
| `BACKEND_PORT`         | Porta interna do backend                           | `8080`                                    |

---

## 🚀 Como executar

### Subir o projeto completo

Com Docker e Docker Compose instalados, na raiz do repositório:

```bash
docker compose up --build
```

Aguarde o healthcheck do PostgreSQL e a mensagem indicando que o seed foi executado.

### Acessar a aplicação

| Recurso              | URL                                  |
|----------------------|--------------------------------------|
| 🌐 Frontend          | http://localhost                     |
| 📘 Swagger UI        | http://localhost/api/docs            |
| 📕 ReDoc             | http://localhost/api/redoc           |
| 🩺 Health check      | http://localhost/api/health          |
| 📄 OpenAPI JSON      | http://localhost/api/openapi.json    |

### Encerrar

```bash
docker compose down            # mantém o volume do banco
docker compose down -v         # remove também o volume (apaga dados)
```

---

## 🧪 Credenciais de demonstração

O seed automático popula o banco na primeira execução com os seguintes usuários:

| Perfil | Login                                                      | Senha       |
|--------|------------------------------------------------------------|-------------|
| 🔐 Admin | `admin@portal.local`                                     | `admin123`  |
| 👤 Aluno | `arthur.sandrini@portal.local` ou matrícula `20241si017` | `aluno123`  |
| 👤 Aluno | `eduardo.pereira@portal.local` ou `20241si022`           | `aluno123`  |
| 👤 Aluno | `marcos.paes@portal.local` ou `20241si031`               | `aluno123`  |
| 👤 Aluno | `beatriz.oliveira@portal.local` ou `20241rc004`          | `aluno123`  |
| 👤 Aluno | `camila.souza@portal.local` ou `20241es012`              | `aluno123`  |

> Alunos podem fazer login com **e-mail** ou **número de matrícula**.

---

## 🛣️ Rotas da API

Todas as rotas são consumidas pelo NGINX no prefixo `/api`. Documentação interativa disponível em [`/api/docs`](http://localhost/api/docs).

### 💚 Saúde
| Método | Rota               | Acesso  |
|--------|--------------------|---------|
| GET    | `/api/health`      | público |

### 🔐 Autenticação
| Método | Rota               | Acesso        |
|--------|--------------------|---------------|
| POST   | `/api/auth/login`  | público       |
| GET    | `/api/auth/me`     | autenticado   |

### 👤 Área do Aluno
| Método | Rota                    | Acesso |
|--------|-------------------------|--------|
| GET    | `/api/alunos/me`        | aluno  |
| GET    | `/api/alunos/me/cursos` | aluno  |

### 🎓 Alunos (admin)
| Método | Rota                       |
|--------|----------------------------|
| GET    | `/api/alunos`              |
| POST   | `/api/alunos`              |
| GET    | `/api/alunos/{id}`         |
| PUT    | `/api/alunos/{id}`         |
| DELETE | `/api/alunos/{id}` *(lógico, `ativo=false`)* |
| GET    | `/api/alunos/{id}/cursos`  |

### 📚 Cursos (admin)
| Método | Rota                       |
|--------|----------------------------|
| GET    | `/api/cursos`              |
| POST   | `/api/cursos`              |
| GET    | `/api/cursos/{id}`         |
| PUT    | `/api/cursos/{id}`         |
| DELETE | `/api/cursos/{id}` *(lógico, `ativo=false`)* |
| GET    | `/api/cursos/{id}/alunos`  |

### 🔗 Matrículas (admin)
| Método | Rota                          |
|--------|-------------------------------|
| GET    | `/api/matriculas`             |
| POST   | `/api/matriculas`             |
| GET    | `/api/matriculas/{id}`        |
| PUT    | `/api/matriculas/{id}`        |
| DELETE | `/api/matriculas/{id}` *(lógico, `status=cancelada`)* |

### Autenticação JWT no Swagger

1. Faça login em `POST /api/auth/login` e copie o `access_token`.
2. Clique em **Authorize** no canto superior direito do Swagger.
3. Informe o token no formato:
   ```text
   Bearer seu_token_aqui
   ```

---

## 🗃️ Modelo de dados

```text
┌──────────────────┐        ┌────────────────┐        ┌──────────────┐
│ administradores  │        │   matriculas   │        │   cursos     │
├──────────────────┤        ├────────────────┤        ├──────────────┤
│ id (PK)          │        │ id (PK)        │        │ id (PK)      │
│ nome             │        │ aluno_id (FK)──┼────┐   │ nome         │
│ email            │        │ curso_id (FK)──┼──┐ │   │ sigla        │
│ senha            │        │ status         │  │ │   │ carga_horaria│
│ ativo            │        │ data_matricula │  │ │   │ descricao    │
└──────────────────┘        │ UNIQUE(aluno,  │  │ │   │ ativo        │
                            │        curso)  │  │ │   │ cor          │
                            └────────────────┘  │ │   └──────┬───────┘
                                                │ │          │
                       ┌───────────┐            │ └──────────┘
                       │  alunos   │◄───────────┘
                       ├───────────┤
                       │ id (PK)   │
                       │ nome      │
                       │ email     │
                       │ matricula │
                       │ data_nasc │
                       │ senha     │
                       │ ativo     │
                       │ cor       │
                       └───────────┘
```

- **Relação muitos-para-muitos** entre `alunos` e `cursos`, intermediada por `matriculas`.
- **`UNIQUE(aluno_id, curso_id)`** impede a duplicação de matrículas.
- **Exclusão lógica:** alunos/cursos viram `ativo=false`; matrículas viram `status=cancelada`.

---

## 🖥️ Desenvolvimento do frontend

O frontend é uma SPA em **React 18 + Vite**. Em produção, é compilado em uma imagem Node e servido como assets estáticos pelo NGINX.

### Rodar apenas o frontend em modo dev

```bash
cd frontend
npm install
npm run dev
```

O Vite sobe na porta `5173` e faz proxy de `/api` para `http://localhost`, então as chamadas continuam batendo no backend rodando via Docker (`fastapi` por trás do NGINX).

### Scripts disponíveis

| Script           | Descrição                                |
|------------------|------------------------------------------|
| `npm run dev`    | Servidor de desenvolvimento (Vite HMR)   |
| `npm run build`  | Build de produção em `dist/`             |
| `npm run preview`| Pré-visualização do build                |

---

## 🧱 Decisões técnicas

- **Senhas em texto puro:** decisão consciente de escopo acadêmico — em produção, usar `bcrypt`/`argon2`.
- **JWT com `python-jose`:** token simples carregando `id`, `email` e `tipo` (`admin` | `aluno`).
- **Criação automática de tabelas:** `Base.metadata.create_all` no `lifespan` do FastAPI; sem Alembic.
- **Seed idempotente:** só roda se a tabela `administradores` estiver vazia.
- **Rede dupla:** `backend_db` é `internal: true`, isolando o PostgreSQL de qualquer rota externa.
- **NGINX como build target do frontend:** o `Dockerfile` do frontend usa multi-stage (build com Node, serve com NGINX), enquanto o `nginx.conf` raiz do projeto é montado como volume sobre `default.conf`.

---

## 📜 Licença

Distribuído sob os termos do arquivo [`LICENSE`](LICENSE).
