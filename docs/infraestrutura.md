# Portal de Matriculas - Mapeamento de Infraestrutura e Implementacao

## 1. Visao geral

O projeto sera uma aplicacao conteinerizada chamada **Portal de Matriculas**, baseada na topologia obrigatoria da atividade:

- `nginx`: unico servico exposto ao hospedeiro, responsavel pelo frontend estatico e pelo proxy reverso.
- `fastapi`: backend Python/FastAPI com API HTTP na porta interna `8080`.
- `postgres`: banco PostgreSQL com persistencia em volume Docker.

Tema do grupo:

- **Controle de Alunos e Cursos**
- Integrantes:
  - Arthur Sandrini
  - Eduardo Pereira
  - Marcos Paes

O sistema tera controle de acesso por perfil:

- **Administrador**: pode criar, listar, editar e remover alunos, cursos e matriculas conforme escopo definido.
- **Aluno**: pode acessar apenas sua propria visualizacao e consultar os cursos em que esta matriculado.

## 2. Decisoes de modelagem

### 2.1 Relacionamento alunos x cursos

Foi definido que um aluno pode estar matriculado em varios cursos. Portanto, apesar da lista inicial de campos mencionar `curso_id` em `alunos`, a modelagem correta nao deve usar apenas um `curso_id` direto na tabela de alunos.

Para representar o relacionamento muitos-para-muitos, sera criada uma entidade intermediaria:

- `matriculas`

Assim, o aluno nao pertence a somente um curso; ele possui varias matriculas, cada uma apontando para um curso.

Modelo recomendado:

```text
alunos 1 --- N matriculas N --- 1 cursos
```

### 2.2 Entidades principais

#### alunos

Campos sugeridos:

- `id`
- `nome`
- `email`
- `matricula`
- `data_nascimento`
- `senha`
- `ativo`
- `criado_em`
- `atualizado_em`

Observacao: `curso_id` nao fica em `alunos`, pois o relacionamento com cursos sera feito por `matriculas`.

#### cursos

Campos:

- `id`
- `nome`
- `sigla`
- `carga_horaria`
- `descricao`
- `ativo`
- `criado_em`
- `atualizado_em`

#### administradores

Campos sugeridos:

- `id`
- `nome`
- `email`
- `senha`
- `ativo`
- `criado_em`
- `atualizado_em`

#### matriculas

Campos sugeridos:

- `id`
- `aluno_id`
- `curso_id`
- `status`
- `data_matricula`
- `criado_em`
- `atualizado_em`

Valores sugeridos para `status`:

- `ativa`
- `trancada`
- `concluida`
- `cancelada`

Restricao importante:

- A combinacao `aluno_id + curso_id` deve ser unica, para evitar que o mesmo aluno seja matriculado duas vezes no mesmo curso.

## 3. Controle de acesso

### 3.1 Perfis

O backend deve implementar autenticacao simples com dois perfis:

- `admin`
- `aluno`

### 3.2 Autenticacao recomendada

Implementacao definida:

- Endpoint de login recebendo `email` e `senha`.
- Senhas armazenadas no banco em texto simples, apenas por se tratar de um projeto demonstrativo da disciplina.
- Retorno de token JWT basico para identificar se o usuario autenticado e `admin` ou `aluno`.
- Rotas protegidas validando o token.

Bibliotecas sugeridas:

- `python-jose` ou `PyJWT` para JWT.

Observacao: em um sistema real, as senhas deveriam ser armazenadas com hash seguro. Neste projeto, a decisao foi manter simples para reduzir escopo.

### 3.3 Regras de autorizacao

Administrador:

- CRUD completo de alunos.
- CRUD completo de cursos.
- Criar/remover/alterar matriculas.
- Listar todos os alunos.
- Listar todos os cursos.
- Ver cursos de qualquer aluno.
- O administrador inicial sera criado via seed.
- Nao havera CRUD de administradores nesta primeira versao.

Aluno:

- Fazer login com seu email/matricula e senha.
- Visualizar seus proprios dados.
- Listar apenas os cursos em que esta matriculado.
- Nao pode cadastrar, editar ou remover alunos/cursos.
- Nao pode ver dados completos de outros alunos.

## 4. Rotas da API

O frontend deve consumir a API sempre pelo caminho `/api`, passando pelo NGINX.

### 4.1 Autenticacao

```http
POST /api/auth/login
GET  /api/auth/me
```

### 4.2 Alunos

Rotas administrativas:

```http
GET    /api/alunos
POST   /api/alunos
GET    /api/alunos/{id}
PUT    /api/alunos/{id}
DELETE /api/alunos/{id}
```

Rotas do proprio aluno:

```http
GET /api/alunos/me
GET /api/alunos/me/cursos
```

### 4.3 Cursos

Rotas administrativas:

```http
GET    /api/cursos
POST   /api/cursos
GET    /api/cursos/{id}
PUT    /api/cursos/{id}
DELETE /api/cursos/{id}
```

Opcionalmente, alunos autenticados tambem podem acessar:

```http
GET /api/cursos
GET /api/cursos/{id}
```

mas isso depende se o grupo quer que o aluno veja o catalogo completo ou apenas seus cursos. Pela regra definida, a visualizacao do aluno deve priorizar apenas os cursos cadastrados para ele.

### 4.4 Matriculas

Rotas administrativas:

```http
GET    /api/matriculas
POST   /api/matriculas
GET    /api/matriculas/{id}
PUT    /api/matriculas/{id}
DELETE /api/matriculas/{id}
```

Rotas uteis:

```http
GET /api/alunos/{id}/cursos
GET /api/cursos/{id}/alunos
```

## 5. Dados iniciais

O sistema deve subir com dados de exemplo para facilitar a demonstracao em sala.

Dados iniciais recomendados:

### Administrador

- Nome: Administrador
- Email: `admin@portal.local`
- Senha: `admin123`

### Cursos

Exemplos:

- Sistemas de Informacao, sigla `SI`, carga horaria `3200`
- Redes de Computadores, sigla `RC`, carga horaria `2400`
- Engenharia de Software, sigla `ES`, carga horaria `3000`

### Alunos

Exemplos:

- Arthur Sandrini
- Eduardo Pereira
- Marcos Paes

Cada aluno pode ser criado com email institucional ficticio e senha inicial simples para demonstracao.

### Matriculas

Criar algumas matriculas iniciais ligando alunos a mais de um curso, para demonstrar que o relacionamento muitos-para-muitos funciona.

## 6. Estrutura sugerida do projeto

```text
portal-de-matriculas/
|-- docker-compose.yml
|-- README.md
|-- .env
|-- .env.example
|-- backend/
|   |-- Dockerfile
|   |-- requirements.txt
|   |-- app/
|   |   |-- main.py
|   |   |-- database.py
|   |   |-- models.py
|   |   |-- security.py
|   |   |-- seed.py
|   |   |-- routes/
|   |   |   |-- auth.py
|   |   |   |-- alunos.py
|   |   |   |-- cursos.py
|   |   |   |-- matriculas.py
|   |   |-- schemas/
|   |   |   |-- auth.py
|   |   |   |-- alunos.py
|   |   |   |-- cursos.py
|   |   |   |-- matriculas.py
|-- nginx/
|   |-- nginx.conf
|   |-- certs/
|   |   |-- portal.local.crt
|   |   |-- portal.local.key
|   |-- html/
|   |   |-- index.html
|   |   |-- style.css
|   |   |-- script.js
```

Observacao: como o design sera implementado separadamente, os arquivos do frontend podem inicialmente conter apenas a base minima para consumir a API.

## 7. Docker Compose

### 7.1 Servicos

Servicos obrigatorios:

- `nginx`
- `fastapi`
- `postgres`

Rede obrigatoria:

- `netatividade01`

Volumes recomendados:

- `postgres_data`: persistencia do banco.
- Volume de codigo para o backend durante desenvolvimento, se desejado.
- Volume para servir os arquivos estaticos do NGINX, se desejado.

### 7.2 Portas

Conforme instrucoes da atividade, apenas o NGINX deve expor portas ao hospedeiro:

```yaml
ports:
  - "80:8080"
  - "443:8443"
```

Isso significa que o NGINX deve escutar dentro do container nas portas:

- `8080` para HTTP
- `8443` para HTTPS

O FastAPI deve escutar na porta interna:

- `8080`

O PostgreSQL nao deve expor porta para o hospedeiro.

### 7.3 Dependencia e healthcheck

O `fastapi` deve depender do `postgres`.

Recomendacao:

- Criar `healthcheck` no PostgreSQL usando `pg_isready`.
- Configurar `depends_on` com condicao de saude, caso a versao do Docker Compose suporte `condition: service_healthy`.
- Criar `healthcheck` no FastAPI usando uma rota `/api/health`.
- Criar `healthcheck` no NGINX chamando `/api/health` ou a raiz `/`.

Rotas recomendadas de saude:

```http
GET /api/health
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

## 8. Variaveis de ambiente

Criar um arquivo `.env.example` versionado e um `.env` local.

### 8.1 Exemplo de `.env.example`

```env
PROJECT_NAME=Portal de Matriculas

POSTGRES_DB=portal_matriculas
POSTGRES_USER=postgres
POSTGRES_PASSWORD=20241si017
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

DATABASE_URL=postgresql+psycopg2://postgres:20241si017@postgres:5432/portal_matriculas

JWT_SECRET_KEY=trocar_esta_chave_em_ambiente_real
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=120

BACKEND_HOST=fastapi
BACKEND_PORT=8080
```

Senha definida para o PostgreSQL:

- `20241si017`

## 9. NGINX

### 9.1 Responsabilidades

O NGINX deve:

- Servir o frontend estatico em `/`.
- Encaminhar `/api` para o FastAPI.
- Ser o unico container com portas mapeadas no hospedeiro.
- Escutar em `8080` e `8443` dentro do container.

### 9.2 Proxy reverso

Configuracao conceitual:

```nginx
server {
    listen 8080;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://fastapi:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

No Docker Compose, o nome `fastapi` funciona como DNS interno da rede `netatividade01`. Isso e preferivel a fixar IP manualmente, embora cumpra a ideia de encaminhar para o backend dentro da topologia.

## 10. HTTPS com certificado local

### 10.1 Dificuldade

A dificuldade e **baixa a media**.

Para a atividade, HTTPS local e viavel, mas exige alguns cuidados extras:

- Gerar certificado e chave local.
- Montar os arquivos no container NGINX.
- Configurar um bloco `server` escutando em `8443` com `ssl_certificate` e `ssl_certificate_key`.
- Mapear `443:8443` no Docker Compose.
- Aceitar o aviso de certificado no navegador ou instalar o certificado como confiavel na maquina.

### 10.2 O que precisa

Arquivos esperados:

```text
nginx/certs/portal.local.crt
nginx/certs/portal.local.key
```

Comando possivel para gerar certificado autoassinado:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/portal.local.key \
  -out nginx/certs/portal.local.crt \
  -subj "/CN=localhost"
```

No Windows, isso depende de ter OpenSSL instalado. Alternativas:

- Usar Git Bash, se vier com OpenSSL disponivel.
- Usar WSL.
- Usar `mkcert`, que cria certificados locais mais amigaveis.

### 10.3 Configuracao conceitual do NGINX para HTTPS

```nginx
server {
    listen 8443 ssl;

    ssl_certificate /etc/nginx/certs/portal.local.crt;
    ssl_certificate_key /etc/nginx/certs/portal.local.key;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://fastapi:8080/api/;
    }
}
```

### 10.4 Recomendacao

Implementar HTTPS local como diferencial e possivel, mas a primeira versao sera entregue com HTTP completo. A ordem definida e:

- FastAPI conectado ao PostgreSQL.
- CRUD funcionando.
- Login e autorizacao funcionando.
- NGINX servindo frontend e proxyando `/api`.
- Healthchecks ativos.

Depois disso, adicionar HTTPS fica bem controlado.

## 11. Backend FastAPI

### 11.1 Bibliotecas sugeridas

```text
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
pydantic
python-dotenv
python-jose[cryptography]
```

### 11.2 Organizacao interna

Responsabilidades:

- `database.py`: conexao com PostgreSQL e sessao do SQLAlchemy.
- `models.py`: modelos ORM.
- `schemas/`: modelos Pydantic de entrada e saida.
- `routes/`: endpoints da API.
- `security.py`: JWT e dependencias de autenticacao/autorizacao.
- `seed.py`: carga inicial de administradores, alunos, cursos e matriculas.
- `main.py`: instancia FastAPI, inclusao de rotas e evento de inicializacao.

### 11.3 Inicializacao do banco

Opcoes:

1. Criar tabelas automaticamente com SQLAlchemy no startup.
2. Usar migrations com Alembic.

Para a atividade, criar tabelas automaticamente e rodar seed inicial e suficiente. Migrations seriam um diferencial, mas aumentam a complexidade.

## 12. Frontend

Como o design sera implementado separadamente, a infraestrutura deve apenas garantir os pontos de integracao:

- O frontend sera servido pelo NGINX em `/`.
- As chamadas JavaScript devem usar caminhos relativos:

```javascript
fetch("/api/alunos")
fetch("/api/cursos")
fetch("/api/auth/login")
```

Nao usar `localhost:8080` no frontend, pois o backend nao sera exposto diretamente ao hospedeiro.

Telas esperadas pela regra de negocio:

- Login.
- Area do administrador:
  - Gerenciar alunos.
  - Gerenciar cursos.
  - Gerenciar matriculas.
- Area do aluno:
  - Meus dados.
  - Meus cursos matriculados.

## 13. README

O `README.md` final deve conter:

- Nome do projeto.
- Integrantes.
- Tema do grupo.
- Arquitetura dos containers.
- Como configurar `.env`.
- Como executar:

```bash
docker compose up --build
```

- Como acessar:

```text
http://localhost
```

- Credenciais iniciais de demonstracao.
- Exemplos de uso da API.
- Observacao sobre HTTPS local como diferencial posterior.

## 14. Decisoes fechadas antes da implementacao

Decisoes confirmadas:

- A senha do PostgreSQL sera `20241si017`.
- Alunos terao senha propria armazenada no banco.
- Por ser um exemplo academico, as senhas nao serao criptografadas nesta versao.
- A autenticacao usara JWT basico.
- Alunos visualizam somente os cursos em que estao matriculados.
- A remocao sera logica, usando `ativo = false`.
- Havera apenas um administrador inicial criado via seed.
- Nao havera CRUD de administradores nesta primeira versao.
- A primeira versao sera HTTP completa; HTTPS local fica como diferencial posterior.

Regras finais recomendadas:

- Usar senha propria para alunos.
- Aluno ve apenas cursos matriculados.
- Administrador ve tudo.
- Usar remocao logica para alunos e cursos, evitando apagar historico de matriculas.
