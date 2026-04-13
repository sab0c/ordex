# OrdeX - Teste Técnico Full Stack

Aplicação full stack para gerenciamento de Ordens de Serviço, construída como monorepo com:

- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Backend:** NestJS + TypeScript + TypeORM + PostgreSQL
- **Infra:** Docker Compose para subir API + banco

O projeto cobre os requisitos principais do desafio: listagem, criação, filtros, ordenação, atualização de status, regras de negócio, autenticação, testes e documentação técnica.

## Sumário

- [Visão Geral](#visão-geral)
- [Stack e Tecnologias](#stack-e-tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
- [Como Rodar os Testes](#como-rodar-os-testes)
- [Decisões Arquiteturais](#decisões-arquiteturais)
- [Endpoints Principais](#endpoints-principais)
- [Critérios do Desafio Cobertos](#critérios-do-desafio-cobertos)

## Visão Geral

O OrdeX permite:

- Listar ordens com paginação
- Filtrar por cliente e status
- Ordenar por data e valor estimado
- Criar novas ordens
- Editar ordens existentes
- Atualizar status com regras de negócio
- Visualizar métricas no dashboard

Também inclui:

- Autenticação via JWT (backend)
- Documentação Swagger
- Mock de API no frontend para desenvolvimento isolado
- Testes unitários, de componente e e2e

## Stack e Tecnologias

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- MSW (Mock Service Worker)
- Jest + Testing Library

### Backend

- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL
- JWT (Passport)
- Class Validator / ValidationPipe
- Swagger
- Jest + Supertest

## Estrutura do Projeto

```text
ordex/
  backend/      # API REST (NestJS)
  frontend/     # Aplicação web (Next.js)
  docker-compose.yml
  package.json  # scripts de orquestração do monorepo
```

## Como Rodar o Projeto

### Pré-requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose (opcional, para ambiente completo com banco)

### 1) Instalar dependências

Na raiz do projeto:

```bash
npm install
```

### 2) Configurar variáveis de ambiente

#### Frontend

Copie `frontend/.env.example` para `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> `NEXT_PUBLIC_API_MODE=mock` permite rodar o frontend sem backend, usando MSW + IndexedDB.

#### Backend

Copie `backend/.env.example` para `backend/.env`:

```bash
PORT=3000
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/ordex
DB_SYNCHRONIZE=false
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
THROTTLE_TTL=60000
THROTTLE_LIMIT=60
JWT_SECRET=<replace-with-a-secure-secret>
JWT_EXPIRES_IN=1h
ADMIN_USERNAME=<replace-with-admin-username>
ADMIN_PASSWORD=<replace-with-admin-password>
```

---

### Opção A - Rodar somente o frontend (modo mock)

Ideal para validar UX e fluxo funcional sem depender de banco/API.

Na raiz:

```bash
npm run dev:frontend
```

- Frontend: [http://localhost:3001](http://localhost:3001)
- Login mock padrão: `admin / admin`

---

### Opção B - Rodar full stack local (sem Docker)

1. Suba um PostgreSQL local e ajuste `DATABASE_URL`
2. Em terminais separados (na raiz):

```bash
npm run dev:backend
npm run dev:frontend
```

3. Para aplicar migrations no backend:

```bash
cd backend
npm run migration:run
```

---

### Opção C - Rodar com Docker (API + banco)

Na raiz:

```bash
npm run docker:up
```

Isso sobe:

- API em `http://localhost:3000`
- PostgreSQL em `localhost:5433`

Para parar:

```bash
npm run docker:down
```

## Como Rodar os Testes

### Testes de todo o monorepo (backend unit + backend e2e)

Na raiz:

```bash
npm test
```

Scripts relacionados:

```bash
npm run test:backend
npm run test:e2e:backend
```

> Observação: os testes e2e padrão ignoram a suíte `real-db`.

### Backend

No diretório `backend`:

```bash
npm run test           # unitários + integração em memória
npm run test:e2e       # e2e (sem real-db)
npm run test:e2e:real  # e2e contra banco real
```

### Frontend

No diretório `frontend`:

```bash
npm run test
```

Também é recomendado validar qualidade:

```bash
npm run lint
npm run build
```

## Decisões Arquiteturais

### 1) Monorepo com workspaces

**Decisão:** manter frontend e backend no mesmo repositório com scripts centralizados na raiz.  
**Motivo:** simplifica onboarding, padroniza comandos e facilita avaliação técnica ponta a ponta.

### 2) Backend em camadas + SOLID

**Decisão:** separar `Controller -> Service -> Repository`, com contrato de repositório injetado por token (`ORDER_REPOSITORY`).  
**Motivo:** desacoplamento entre regra de negócio e persistência, facilitando testes e troca de implementação.

### 3) Regras de negócio no Service

**Decisão:** validações de transição e editabilidade da ordem ficam no `OrdersService`.  
**Motivo:** manter regra de domínio centralizada e independente de transporte (HTTP) ou banco.

Regras implementadas:

- Ordem cancelada não pode ser alterada
- Ordem só pode ir para concluída se estiver em andamento
- Datas de atualização são registradas na persistência

### 4) Query eficiente para métricas

**Decisão:** agregar métricas no banco com `COUNT(*) FILTER (...)` e `SUM(...)`.  
**Motivo:** evita múltiplas consultas e processamento em memória para dashboard.

### 5) Busca por cliente sem acento

**Decisão:** normalização de texto para comparação acento-insensível.  
**Motivo:** melhora usabilidade do filtro de cliente para nomes em português.

### 6) Segurança e robustez da API

**Decisão:** uso combinado de JWT guard, ValidationPipe global, Exception Filter, Helmet e throttling.  
**Motivo:** proteger endpoints, validar payloads de forma padronizada e estruturar erros.

### 7) Frontend com modo mock e modo API real

**Decisão:** alternar estratégia via `NEXT_PUBLIC_API_MODE`.  
**Motivo:** permitir desenvolvimento e demonstração mesmo sem backend disponível.

No modo mock:

- MSW intercepta chamadas
- dados persistem no navegador (IndexedDB)
- seed inicial acelera testes manuais

### 8) Componentização e tipagem no frontend

**Decisão:** dividir tela em componentes por responsabilidade, com tipos explícitos para dados e props.  
**Motivo:** facilitar manutenção, legibilidade e evolução incremental da interface.

### 9) Estratégia de testes pragmática

**Decisão:** combinar testes unitários/integração/e2e no backend e teste de componente no frontend.  
**Motivo:** garantir cobertura de regra de negócio, contratos HTTP e comportamento visual básico.

## Endpoints Principais

### Auth

- `POST /auth/login` - autentica usuário admin e retorna JWT

### Orders (protegidos por JWT)

- `GET /orders` - lista com filtros, ordenação e paginação
- `GET /orders/metrics` - métricas agregadas
- `GET /orders/:id` - busca por id
- `POST /orders` - cria ordem
- `PATCH /orders/:id` - atualiza dados da ordem
- `PATCH /orders/:id/status` - atualiza status da ordem

### Documentação interativa

- Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)

## Critérios do Desafio Cobertos

- Organização em camadas no backend
- Separação de componentes no frontend
- Estado e sessão no frontend com Context API
- Consumo de API real e mockada (MSW)
- Filtros por cliente/status, ordenação por data/valor e paginação
- Regras de negócio explícitas no domínio
- Middleware de logging de requisições
- Testes implementados (backend + frontend)
- README detalhado com execução, testes e decisões técnicas