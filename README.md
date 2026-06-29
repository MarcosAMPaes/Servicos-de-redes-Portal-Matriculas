# Portal de Matriculas - Grupo 4

Aplicacao web do tema **Controle de Alunos e Cursos**, com frontend estatico no NGINX, API FastAPI, PostgreSQL e coleta centralizada de logs com Grafana Loki.

Orquestrador usado na atividade: **Docker Swarm**.

## Integrantes

- Arthur Sandrini
- Eduardo Pereira
- Marcos Paes

## Topologia do Swarm

```text
VM1 - camada de dados (worker)
  - postgres: 1 replica, volume local postgres_data
  - loki:     1 replica, volume local loki_data

VM2 - camada de aplicacao (manager)
  - fastapi: 2 replicas, porta 8080 apenas na rede overlay
  - nginx:   2 replicas, portas publicadas 80 e 443

Rede interna: portal_matriculas_portal_overlay (overlay, attachable)
Labels:
  VM1: node.labels.portal.layer=data
  VM2: node.labels.portal.layer=app
```

Somente o NGINX publica portas para fora do cluster. PostgreSQL, Loki e FastAPI ficam acessiveis apenas pela rede overlay.

## Arquivos principais

- `docker-stack/docker-stack.yml`: stack do Docker Swarm com replicas, constraints, rede overlay, volumes e secret.
- `loki/loki-config.yaml`: configuracao minima do Loki.
- `backend/app/logger.py`: cliente HTTP que envia logs para a Push API do Loki.
- `backend/app/database.py`: aceita senha do banco via secret do Swarm.
- `nginx/Dockerfile`: imagem do NGINX com frontend, proxy e certificado local autoassinado.

## Deploy em Docker Swarm

Execute os comandos de administracao no manager (**VM2**), exceto o comando `docker swarm join`, que deve ser executado na **VM1**.

1. Inicializar o Swarm na VM2:

```bash
docker swarm init --advertise-addr <IP-VM2>
```

2. Gerar o comando de entrada para a VM1:

```bash
docker swarm join-token worker
```

3. Executar na VM1 o comando exibido, por exemplo:

```bash
docker swarm join --token <TOKEN> <IP-VM2>:2377
```

4. Conferir os nomes dos nos e aplicar labels:

```bash
docker node ls
docker node update --label-add portal.layer=data <NOME-DA-VM1>
docker node update --label-add portal.layer=app <NOME-DA-VM2>
```

5. Criar o secret da senha do PostgreSQL:

```bash
printf "20241si017" | docker secret create postgres_password -
```

No PowerShell:

```powershell
"20241si017" | docker secret create postgres_password -
```

6. Construir as imagens locais na VM2:

```bash
docker build -t portal-matriculas-fastapi:latest ./backend
docker build -t portal-matriculas-nginx:latest -f nginx/Dockerfile .
```

7. Implantar a stack:

```bash
docker stack deploy --resolve-image never -c docker-stack/docker-stack.yml portal_matriculas
```

Use `--resolve-image never` porque as imagens da FastAPI e do NGINX sao locais. Como ambos os servicos sao fixados na VM2, nao e obrigatorio publicar essas imagens em um registry.

## Verificacao

Estado geral:

```bash
docker stack services portal_matriculas
docker stack ps portal_matriculas
```

Conferir posicionamento das tarefas:

```bash
docker service ps portal_matriculas_postgres
docker service ps portal_matriculas_loki
docker service ps portal_matriculas_fastapi
docker service ps portal_matriculas_nginx
```

Gerar uma requisicao para aparecer no Loki:

```bash
curl http://<IP-VM2>/api/health
```

Acessos:

- Frontend: `http://<IP-VM2>`
- HTTPS com certificado autoassinado: `https://<IP-VM2>`
- Swagger da API via NGINX: `http://<IP-VM2>/api/docs`

Credenciais de demonstracao:

```text
Admin: admin@portal.local / admin123
Aluno: arthur.sandrini@portal.local / aluno123
```

## Consultar logs no Loki

O Loki nao publica a porta 3100 no host. Para consultar pela API HTTP sem expor o servico, use um container temporario conectado na rede overlay:

```bash
docker run --rm --network portal_matriculas_portal_overlay curlimages/curl:8.8.0 \
  http://loki:3100/loki/api/v1/labels
```

Consultar logs da FastAPI nos ultimos 10 minutos:

```bash
START=$(date -d '10 minutes ago' +%s000000000)
END=$(date +%s000000000)

docker run --rm --network portal_matriculas_portal_overlay curlimages/curl:8.8.0 -G \
  'http://loki:3100/loki/api/v1/query_range' \
  --data-urlencode 'query={service="fastapi"}' \
  --data-urlencode "start=$START" \
  --data-urlencode "end=$END"
```

Os eventos enviados incluem:

- inicializacao da FastAPI;
- cada requisicao HTTP recebida, com metodo, rota e status;
- erros de conexao ou inicializacao do PostgreSQL.

## Demonstrar que portas internas nao estao expostas

No manager:

```bash
docker service ls
```

Somente `portal_matriculas_nginx` deve aparecer com portas publicadas. Os servicos `postgres`, `loki` e `fastapi` nao devem listar portas em `PORTS`.

Opcionalmente, de uma maquina fora do cluster:

```bash
curl http://<IP-VM1>:5432
curl http://<IP-VM1>:3100/loki/api/v1/labels
curl http://<IP-VM2>:8080/api/health
```

Esses acessos diretos nao devem funcionar; o acesso externo correto e pelo NGINX nas portas 80/443.

## Encerrar o ambiente

```bash
docker stack rm portal_matriculas
docker secret rm postgres_password
```

Os volumes locais `portal_matriculas_postgres_data` e `portal_matriculas_loki_data` permanecem na VM1 para preservar dados.

## Execucao local com Docker Compose

Para desenvolvimento em uma unica maquina:

```bash
cp .env.example .env
docker compose up --build
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

A aplicacao local fica em `http://localhost`. Esse modo e apenas para desenvolvimento; a entrega da atividade deve ser demonstrada pela stack do Docker Swarm.
