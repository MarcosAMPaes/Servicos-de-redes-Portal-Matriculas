# Serviços-de-redes-Portal-Matriculas

## Subir o projeto completo

```bash
docker compose up --build
```

Depois acesse:

- Frontend: `http://localhost`
- Swagger: `http://localhost/api/docs`

## Frontend com React + Vite

O frontend foi migrado para React com Vite e é construído em uma imagem Node antes de ser servido pelo NGINX.

Para rodar apenas o frontend em modo desenvolvimento:

```bash
cd frontend
npm install
npm run dev
```

O Vite usa proxy para `/api`, então as chamadas continuam usando os mesmos caminhos do backend, como `/api/auth/login`, `/api/alunos` e `/api/cursos`.
