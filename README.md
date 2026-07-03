# Portal de Matriculas - Grupo 4

Sistema academico para gerenciamento de alunos, cursos e matriculas, desenvolvido para a disciplina Servicos de Redes para Internet.

O tema herdado do Trabalho 01 e **Controle de Alunos e Cursos**. Para esta etapa, a aplicacao foi adaptada para rodar em **Docker Swarm**.

## Integrantes

- Arthur Sandrini
- Eduardo Pereira
- Marcos Paes

## Tecnologias

- Backend: Python 3.12, FastAPI, Uvicorn, SQLAlchemy, Pydantic e JWT.
- Frontend: React 18 com Vite.
- Banco de dados: PostgreSQL 16.
- Proxy e frontend estatico: NGINX 1.27.
- Logs centralizados: Grafana Loki 3.0.0.
- Visualizacao de logs: Grafana na porta 3000.
- Orquestrador da entrega: Docker Swarm.

## Topologia do cluster

```text
┌──────────────────────────────────────┐   ┌──────────────────────────────────────┐
│      VM1 — Camada de Dados (worker)  │   │   VM2 — Camada de Aplicacao (manager)│
│      node.labels.portal.layer=data   │   │      node.labels.portal.layer=app    │
│                                      │   │                                      │
│  ┌──────────────┐  ┌──────────────┐  │   │  ┌──────────────┐  ┌──────────────┐  │
│  │  postgres    │  │  loki        │  │   │  │  nginx       │  │  fastapi     │  │
│  │  1 replica   │  │  1 replica   │  │   │  │  2 replicas  │  │  2 replicas  │  │
│  │  porta 5432  │  │  porta 3100  │  │   │  │  80/443      │  │  porta 8080  │  │
│  │  (interna)   │  │  (interna)   │  │   │  │  (publicas)  │  │  (interna)   │  │
│  └──────────────┘  └──────────────┘  │   │  └──────────────┘  └──────────────┘  │
│                                      │   │                                      │
│  volumes locais:                     │   │  unico ponto de entrada externo      │
│  postgres_data, loki_data            │   │                                      │
└──────────────────┬───────────────────┘   └──────────────────┬───────────────────┘
                   │                                          │
                   └──── rede overlay (attachable) ───────────┘
                       portal_matriculas_portal_overlay
```

O NGINX publica o portal nas portas 80 e 443. O Grafana publica a interface de logs na porta 3000. PostgreSQL, Loki e FastAPI ficam acessiveis apenas pela rede interna overlay.

## Estrutura principal

```text
Servicos-de-redes-Portal-Matriculas/
├── README.md
├── docker-compose.yml              # Execucao local em uma maquina
├── VagrantFile                     # Provisiona 2 VMs e forma o Swarm (apresentacao)
├── docker-stack/
│   └── docker-stack.yml            # Stack Docker Swarm da entrega
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                 # FastAPI, healthcheck e logs
│       ├── database.py             # Conexao PostgreSQL e secrets
│       ├── logger.py               # Cliente HTTP para Loki
│       ├── models.py
│       ├── seed.py
│       ├── security.py
│       ├── routes/
│       └── schemas/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/main.jsx
│   └── *.jsx / styles.css
├── nginx/
│   ├── Dockerfile                  # Builda o React/Vite e serve com NGINX (Compose e Swarm)
│   └── nginx.conf                  # Frontend estatico e proxy /api
├── grafana/
│   └── provisioning/datasources/
│       └── loki.yml                # Datasource Loki provisionado automaticamente no Grafana
└── loki/
    └── loki-config.yaml
```

## Arquivos importantes

- `docker-stack/docker-stack.yml`: define a stack Swarm com replicas, rede overlay, volumes, secret e placement constraints.
- `docker-compose.yml`: ambiente local equivalente para desenvolvimento e testes em uma unica maquina.
- `loki/loki-config.yaml`: configuracao minima do Loki com armazenamento em volume local.
- `grafana/provisioning/datasources/loki.yml`: configura o datasource Loki automaticamente no Grafana.
- `backend/app/logger.py`: envia logs estruturados para `/loki/api/v1/push`.
- `backend/app/database.py`: aceita senha por `POSTGRES_PASSWORD`, `POSTGRES_PASSWORD_FILE` ou `DATABASE_PASSWORD_FILE`.
- `nginx/Dockerfile`: unica imagem do frontend, usada no Compose e no Swarm; compila o React/Vite e copia o `nginx.conf`.

## Variaveis de ambiente

Para execucao local, copie o exemplo e ajuste se necessario:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Variaveis principais:

| Variavel | Uso |
| --- | --- |
| `POSTGRES_DB` | Nome do banco. Padrao: `portal_matriculas`. |
| `POSTGRES_USER` | Usuario do PostgreSQL. Padrao: `postgres`. |
| `POSTGRES_PASSWORD` | Senha local do PostgreSQL. Padrao academico: `20241si017`. |
| `POSTGRES_HOST` | Host interno do banco. Padrao: `postgres`. |
| `POSTGRES_PORT` | Porta interna do banco. Padrao: `5432`. |
| `DATABASE_URL` | Opcional. Se vazio, a API monta a URL com as variaveis `POSTGRES_*`. |
| `JWT_SECRET_KEY` | Chave usada nos tokens JWT. |
| `LOKI_URL` | Endpoint interno do Loki. Padrao: `http://loki:3100`. |
| `LOKI_SERVICE_NAME` | Label do servico nos logs. Padrao: `fastapi`. |
| `LOKI_ENABLED` | Liga ou desliga envio de logs para o Loki. |

No Swarm, a senha do banco deve ser criada como secret nativo chamado `postgres_password`; a stack injeta esse valor em `/run/secrets/postgres_password`.

## Execucao local com Docker Compose

Use este modo apenas para desenvolvimento em uma maquina:

```bash
docker compose up --build
```

Acessos locais:

| Recurso | URL |
| --- | --- |
| Frontend | `http://localhost` |
| HTTPS local com certificado autoassinado | `https://localhost` |
| Swagger UI | `http://localhost/api/docs` |
| ReDoc | `http://localhost/api/redoc` |
| Health check | `http://localhost/api/health` |

Encerrar:

```bash
docker compose down
docker compose down -v
```

## Subir o cluster com Vagrant (recomendado para a apresentacao)

Este e o caminho automatizado usado na apresentacao. O `VagrantFile` na raiz do repositorio provisiona **2 VMs** (Ubuntu 22.04), instala o Docker nas duas e **forma o Swarm sozinho** durante o `vagrant up`:

| VM | Papel no Swarm | IP | Camada |
| --- | --- | --- | --- |
| `vm2-app` | Manager (Leader) | `192.168.56.12` | app (NGINX, FastAPI) |
| `vm1-dados` | Worker | `192.168.56.11` | data (PostgreSQL, Loki) |

A pasta do projeto e montada dentro das duas VMs em `/home/vagrant/trabalho`, entao o codigo ja fica disponivel no cluster: nao e preciso clonar nada dentro da VM.

### Pre-requisitos no host Windows

Use Windows 10/11 com virtualizacao habilitada na BIOS/UEFI (Intel VT-x ou AMD-V). Instale o VirtualBox e o Vagrant no PowerShell **como Administrador**:

```powershell
winget install --id Oracle.VirtualBox -e
winget install --id Hashicorp.Vagrant -e
shutdown /r /t 0
```

Apos reiniciar, valide:

```powershell
vagrant --version
& "$env:ProgramFiles\Oracle\VirtualBox\VBoxManage.exe" --version
```

Se o comando `winget` nao existir, instale manualmente:

- VirtualBox: https://www.virtualbox.org/wiki/Downloads
- Vagrant: https://developer.hashicorp.com/vagrant/downloads

### Desativar Hyper-V, VBS e Memory Integrity

O VirtualBox precisa de acesso direto a virtualizacao de hardware (VT-x/AMD-V). Se o Hyper-V, VBS, Memory Integrity, Windows Hypervisor Platform ou Virtual Machine Platform ficarem ativos, o VirtualBox pode cair para o modo WHPX, ficar muito lento ou travar no boot das VMs.

Abra o PowerShell **como Administrador** (clique direito -> "Executar como administrador"):

```powershell
# Desativa a inicializacao do hypervisor do Windows
bcdedit /set hypervisorlaunchtype off
bcdedit /set vsmlaunchtype Off

# Desativa recursos opcionais que carregam o hypervisor
Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -NoRestart
Disable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart
Disable-WindowsOptionalFeature -Online -FeatureName WindowsHypervisorPlatform -NoRestart
Disable-WindowsOptionalFeature -Online -FeatureName Containers -NoRestart

# Desativa VBS/Device Guard/Credential Guard/Memory Integrity via registro
reg add "HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard" /v EnableVirtualizationBasedSecurity /t REG_DWORD /d 0 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard" /v HyperVVirtualizationBasedSecurityOptout /t REG_DWORD /d 1 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard" /v RequirePlatformSecurityFeatures /t REG_DWORD /d 0 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" /v Enabled /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DeviceGuard" /v EnableVirtualizationBasedSecurity /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DeviceGuard" /v LsaCfgFlags /t REG_DWORD /d 0 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Lsa" /v LsaCfgFlags /t REG_DWORD /d 0 /f

# Reinicia para aplicar
shutdown /r /t 0
```

Apos reiniciar, confirme no PowerShell:

```powershell
Get-CimInstance Win32_ComputerSystem | Select-Object HypervisorPresent
```

O resultado esperado e:

```text
HypervisorPresent
-----------------
            False
```

Se ainda aparecer `True`, abra **Windows Security > Device security > Core isolation** e desligue **Memory integrity**. Reinicie e rode a verificacao novamente.

> Atencao: esses comandos podem desativar WSL2, Docker Desktop, Windows Sandbox e recursos baseados em Hyper-V enquanto estiverem desligados.
> Para reverter depois: `bcdedit /set hypervisorlaunchtype auto`, reative os recursos necessarios do Windows e reinicie.

### Subir as VMs

Rode a partir da **raiz do repositorio** (onde esta o `VagrantFile`):

```powershell
vagrant destroy -f
vagrant up --provider=virtualbox
```

Isso instala o Docker nas duas VMs e forma o Swarm (`vm2-app` como manager, `vm1-dados` como worker).

### Verificar o cluster

```powershell
vagrant ssh vm2-app -c "sudo docker node ls"
```

Esperado: as duas VMs com `STATUS Ready` e `AVAILABILITY Active`, e `vm2-app` como `Leader`.

### Deploy da stack

Entrar na VM manager:

```powershell
vagrant ssh vm2-app
```

Dentro da `vm2-app`, o projeto ja esta em `/home/vagrant/trabalho`:

```bash
cd /home/vagrant/trabalho

# 1. Labels de placement (separam a camada de dados da de aplicacao)
sudo docker node update --label-add portal.layer=app vm2-app
sudo docker node update --label-add portal.layer=data vm1-dados

# 2. Secret com a senha do banco
sudo docker secret inspect postgres_password >/dev/null 2>&1 || \
  printf "20241si017" | sudo docker secret create postgres_password -

# 3. Build das imagens locais (fastapi e nginx ficam fixadas na vm2)
sudo docker build -t portal-matriculas-fastapi:latest ./backend
sudo docker build -t portal-matriculas-nginx:latest -f nginx/Dockerfile .

# 4. Deploy da stack
sudo docker stack deploy --resolve-image never -c docker-stack/docker-stack.yml portal_matriculas
```

> Na primeira vez, a `vm1-dados` baixa as imagens publicas `postgres:16-alpine` e `grafana/loki:3.0.0`, e a `vm2-app` baixa `grafana/grafana:latest`, entao as VMs precisam de internet. As imagens `fastapi` e `nginx` sao construidas localmente na `vm2-app`; por isso o `--resolve-image never`.

### Verificar o deploy

```bash
sudo docker stack services portal_matriculas
sudo docker stack ps portal_matriculas
curl http://192.168.56.12/api/health
```

Todos os servicos devem chegar com as replicas completas: `postgres 1/1`, `loki 1/1`, `fastapi 2/2`, `nginx 2/2`, `grafana 1/1`.

Acessos pelo navegador do host:

| Recurso | URL |
| --- | --- |
| Portal | `http://192.168.56.12/` |
| API health | `http://192.168.56.12/api/health` |
| Swagger | `http://192.168.56.12/api/docs` |
| Grafana | `http://192.168.56.12:3000/` |

Credenciais padrao do Grafana: `admin` / `admin`.

### Encerrar

Remover a stack e o secret (dentro da `vm2-app`):

```bash
sudo docker stack rm portal_matriculas
sudo docker secret rm postgres_password
```

Destruir as VMs (na raiz do repositorio, no host):

```powershell
vagrant destroy -f
```

---

## Provisionamento manual das VMs (alternativa)

> Use esta secao apenas se **nao** for usar o Vagrant. O caminho recomendado para a apresentacao e a secao **Subir o cluster com Vagrant** acima; as etapas de deploy manual continuam validas na secao **Deploy em Docker Swarm** logo abaixo.

O cluster usa **2 VMs** na mesma rede local. Qualquer ferramenta gratuita serve (VirtualBox, QEMU/KVM, Vagrant ou cloud com camada gratuita).

Configuracao usada como referencia:

| Item | VM1 (dados) | VM2 (aplicacao) |
| --- | --- | --- |
| Sistema | Ubuntu Server 24.04 LTS | Ubuntu Server 24.04 LTS |
| Recursos | 2 vCPU, 2 GB RAM, 20 GB disco | 2 vCPU, 2 GB RAM, 20 GB disco |
| Rede | Modo bridge (mesma rede da VM2) | Modo bridge (mesma rede da VM1) |
| Papel no Swarm | Worker | Manager |

Em cada VM, instale o Docker Engine:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # relogar apos executar
```

Antes de criar o cluster, confirme que as VMs se enxergam (`ping <IP-da-outra-VM>`) e que as portas do Swarm estao liberadas entre elas: `2377/tcp` (gerenciamento), `7946/tcp+udp` (descoberta de nos) e `4789/udp` (trafego da rede overlay). Na VM2, clone este repositorio:

```bash
git clone https://github.com/MarcosAMPaes/Servicos-de-redes-Portal-Matriculas.git
cd Servicos-de-redes-Portal-Matriculas
```

## Deploy em Docker Swarm

Execute os comandos administrativos no manager (**VM2**), exceto o comando `docker swarm join`, que deve ser executado na **VM1**.

1. Inicializar o Swarm na VM2:

```bash
docker swarm init --advertise-addr <IP-VM2>
```

2. Gerar o comando para adicionar a VM1 como worker:

```bash
docker swarm join-token worker
```

3. Executar na VM1 o comando exibido, por exemplo:

```bash
docker swarm join --token <TOKEN> <IP-VM2>:2377
```

4. Conferir os nomes dos nos:

```bash
docker node ls
```

5. Aplicar labels para separar as camadas:

```bash
docker node update --label-add portal.layer=data <NOME-DA-VM1>
docker node update --label-add portal.layer=app <NOME-DA-VM2>
```

6. Criar o secret da senha do PostgreSQL:

```bash
printf "20241si017" | docker secret create postgres_password -
```

No PowerShell:

```powershell
"20241si017" | docker secret create postgres_password -
```

7. Construir as imagens locais na VM2:

```bash
docker build -t portal-matriculas-fastapi:latest ./backend
docker build -t portal-matriculas-nginx:latest -f nginx/Dockerfile .
```

8. Implantar a stack:

```bash
docker stack deploy --resolve-image never -c docker-stack/docker-stack.yml portal_matriculas
```

O `--resolve-image never` evita que o Swarm tente resolver imagens locais em registry externo. Como `fastapi` e `nginx` ficam fixados na VM2, nao e obrigatorio publicar essas imagens no Docker Hub para a demonstracao local.

## Verificacao do Swarm

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
docker service ps portal_matriculas_grafana
```

Validar o healthcheck pela entrada publica:

```bash
curl http://<IP-VM2>/api/health
```

Acessos da aplicacao:

- Frontend: `http://<IP-VM2>`
- HTTPS com certificado autoassinado: `https://<IP-VM2>`
- Swagger da API via NGINX: `http://<IP-VM2>/api/docs`
- Grafana: `http://<IP-VM2>:3000`

## Logs no Loki

O FastAPI envia ao Loki os seguintes eventos exigidos:

- Inicializacao da aplicacao.
- Cada requisicao HTTP recebida, com metodo, rota, status e tempo de resposta.
- Erros de conexao ou inicializacao do PostgreSQL.

### Visualizar logs no Grafana

Acesse `http://<IP-VM2>:3000` e entre com `admin` / `admin`. No menu lateral, abra **Explore**, selecione o datasource **Loki** e rode uma das consultas:

```logql
{service="fastapi"}
```

```logql
{service="fastapi", event="http_request"}
```

```logql
{service="fastapi", event="startup"}
```

Para gerar novos logs, acesse o portal pelo navegador, faca login ou navegue pelas telas, e depois rode a consulta novamente no Grafana.

### Consultar Loki por linha de comando

Como o Loki nao deve publicar a porta 3100 no host, consulte a API HTTP usando um container temporario conectado na rede overlay:

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

No PowerShell, gere os timestamps em nanosegundos assim:

```powershell
$start = ([DateTimeOffset]::UtcNow.AddMinutes(-10).ToUnixTimeSeconds()).ToString() + "000000000"
$end = ([DateTimeOffset]::UtcNow.ToUnixTimeSeconds()).ToString() + "000000000"

docker run --rm --network portal_matriculas_portal_overlay curlimages/curl:8.8.0 -G `
  "http://loki:3100/loki/api/v1/query_range" `
  --data-urlencode "query={service=`"fastapi`"}" `
  --data-urlencode "start=$start" `
  --data-urlencode "end=$end"
```

## Demonstrar portas internas protegidas

No manager:

```bash
docker service ls
```

Somente `portal_matriculas_nginx` e `portal_matriculas_grafana` devem aparecer com portas publicadas. Os servicos `postgres`, `loki` e `fastapi` nao devem listar portas em `PORTS`.

De uma maquina fora do cluster, estes acessos diretos nao devem funcionar:

```bash
curl http://<IP-VM1>:5432
curl http://<IP-VM1>:3100/loki/api/v1/labels
curl http://<IP-VM2>:8080/api/health
```

O acesso externo correto e sempre pelo NGINX nas portas 80 e 443.
O Grafana e a unica excecao, publicado na porta 3000 para visualizacao dos logs.

## Credenciais de demonstracao

| Perfil | Login | Senha |
| --- | --- | --- |
| Admin | `admin@portal.local` | `admin123` |
| Aluno | `arthur.sandrini@portal.local` ou `20241si017` | `aluno123` |
| Aluno | `eduardo.pereira@portal.local` ou `20241si022` | `aluno123` |
| Aluno | `marcos.paes@portal.local` ou `20241si031` | `aluno123` |

Alunos podem fazer login com e-mail ou numero de matricula.

## Rotas principais da API

Todas as rotas passam pelo prefixo `/api` no NGINX.

| Metodo | Rota | Acesso |
| --- | --- | --- |
| GET | `/api/health` | Publico |
| POST | `/api/auth/login` | Publico |
| GET | `/api/auth/me` | Autenticado |
| GET | `/api/alunos/me` | Aluno |
| GET | `/api/alunos/me/matriculas` | Aluno |
| GET/POST | `/api/alunos` | Admin |
| GET/PUT/DELETE | `/api/alunos/{id}` | Admin |
| GET | `/api/alunos/{id}/cursos` | Admin |
| GET/POST | `/api/cursos` | Admin |
| GET/PUT/DELETE | `/api/cursos/{id}` | Admin |
| GET | `/api/cursos/{id}/alunos` | Admin |
| GET/POST | `/api/matriculas` | Admin |
| GET/PUT/DELETE | `/api/matriculas/{id}` | Admin |

Autenticacao no Swagger:

1. Fazer login em `POST /api/auth/login`.
2. Copiar o `access_token`.
3. Clicar em **Authorize**.
4. Informar `Bearer seu_token_aqui`.

## Encerrar o ambiente Swarm

```bash
docker stack rm portal_matriculas
docker secret rm postgres_password
```

Os volumes locais `portal_matriculas_postgres_data` e `portal_matriculas_loki_data` permanecem na VM1 para preservar dados.

## Licenca

Distribuido sob os termos do arquivo `LICENSE`.
