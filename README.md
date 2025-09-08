# Task Flow API

Sistema de gerenciamento de tarefas desenvolvido com Node.js, Fastify, TypeScript e PostgreSQL. Esta API RESTful oferece recursos abrangentes de gerenciamento de tarefas com autenticação de usuários, categorização de tarefas e funcionalidades de colaboração.

## 🚀 Funcionalidades

- **Gerenciamento de Usuários**: Registro de usuários e autenticação baseada em JWT
- **Gerenciamento de Tarefas**: Criar, atualizar, excluir e organizar tarefas
- **Categorias**: Organizar tarefas com categorias personalizadas
- **Colaboração em Tarefas**: Colaboração multi-usuário com permissões baseadas em funções
- **Prioridades de Tarefas**: Suporte para níveis de prioridade BAIXA, MÉDIA e ALTA
- **Acompanhamento de Status**: Status TODO, EM_PROGRESSO e CONCLUÍDO
- **Documentação da API**: Documentação integrada Swagger/OpenAPI

## 🛠 Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT
- **Hash de Senhas**: bcryptjs
- **Testes**: Jest (Testes Unitários)
- **Gerenciador de Pacotes**: pnpm
- **Containerização**: Docker & Docker Compose

## 📋 Pré-requisitos

Antes de executar este projeto, certifique-se de ter os seguintes itens instalados:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [pnpm](https://pnpm.io/) (gerenciador de pacotes recomendado)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

## 🚀 Começando

### Opção 1: Executando com Docker (Recomendado)

1. **Clone o repositório**
   ```bash
   git clone https://github.com/joaovitornunes09/task-flow-api.git
   cd task-flow
   ```

2. **Crie o arquivo de ambiente**
   ```bash
   cp .env.example .env
   ```

3. **Inicie a aplicação**
   ```bash
   docker compose up -d --build
   ```

   Este comando irá:
   - Construir a imagem Docker da aplicação
   - Iniciar um container do PostgreSQL
   - Executar as migrações do banco de dados
   - Iniciar o servidor da API

4. **Acesse a aplicação**
   - API: http://localhost:3333
   - Documentação da API: http://localhost:3333/docs
   - Banco de Dados: localhost:5432

### Opção 2: Executando Localmente

1. **Clone e instale as dependências**
   ```bash
   git clone https://github.com/joaovitornunes09/task-flow-api.git
   cd task-flow
   pnpm install
   ```

2. **Configure o banco de dados**
   ```bash
   # Inicie o PostgreSQL (ou use sua instância existente)
   # Crie um banco de dados chamado 'taskflow'

   # Copie o arquivo de ambiente
   cp .env.example .env

   # Edite o arquivo .env com suas credenciais do banco
   ```

3. **Execute as migrações do banco**
   ```bash
   pnpm prisma:push
   pnpm prisma:generate
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```

## 📚 Documentação da API

Após a aplicação estar rodando, visite http://localhost:3333/docs para acessar a documentação interativa do Swagger UI.

### Principais Endpoints da API

- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Autenticação de usuário
- `GET /tasks` - Listar tarefas do usuário
- `POST /tasks` - Criar uma nova tarefa
- `PUT /tasks/:id` - Atualizar uma tarefa
- `DELETE /tasks/:id` - Excluir uma tarefa
- `GET /categories` - Listar categorias do usuário
- `POST /categories` - Criar uma nova categoria

## 🗄️ Esquema do Banco de Dados

A aplicação utiliza as seguintes entidades principais:

- **Users**: Contas de usuário com autenticação
- **Categories**: Organização e categorização de tarefas
- **Tasks**: Entidades principais de tarefa com status, prioridade e atribuições
- **TaskCollaborations**: Colaboração multi-usuário em tarefas com funções

## 🔧 Scripts Disponíveis

- `pnpm dev` - Iniciar servidor de desenvolvimento com hot reload
- `pnpm build` - Construir o projeto para produção
- `pnpm start` - Iniciar servidor de produção
- `pnpm test` - Executar testes unitários com Jest
- `pnpm prisma:generate` - Gerar cliente Prisma
- `pnpm prisma:push` - Enviar alterações do schema para o banco
- `pnpm prisma:migrate` - Executar migrações do banco de dados
- `pnpm prisma:studio` - Abrir Prisma Studio (interface gráfica do banco)

## 🐳 Comandos Docker

- `docker-compose up --build` - Construir e iniciar todos os serviços
- `docker-compose down` - Parar todos os serviços
- `docker-compose logs app` - Visualizar logs da aplicação
- `docker-compose logs db` - Visualizar logs do banco de dados

## 🏗️ Estrutura do Projeto

```
task-flow/
├── src/
│   ├── generated/       # Arquivos gerados pelo Prisma
│   ├── routes/          # Rotas da API
│   ├── services/        # Lógica de negócio
│   ├── types/           # Definições de tipos TypeScript
│   └── server.ts        # Ponto de entrada da aplicação
├── prisma/
│   └── schema.prisma    # Schema do banco de dados
├── Dockerfile           # Configuração Docker
├── docker-compose.yml   # Configuração multi-container
└── package.json         # Dependências e scripts do projeto
```
