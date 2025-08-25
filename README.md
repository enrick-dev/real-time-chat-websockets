# Chat em Tempo Real - NestJS + React

Este projeto é uma aplicação de chat em tempo real desenvolvida como desafio técnico, utilizando NestJS no backend e React no frontend, com autenticação JWT e comunicação via WebSocket.

## 📋 Descrição do Projeto

O Chat em Tempo Real é uma aplicação completa que permite a comunicação instantânea entre usuários autenticados. O projeto foi desenvolvido seguindo as melhores práticas de desenvolvimento, incluindo autenticação JWT, proteção de rotas, comunicação em tempo real via WebSocket e persistência de dados.

### 🎯 Funcionalidades Principais

- **Autenticação JWT**: Sistema completo de registro e login com tokens JWT
- **Chat em Tempo Real**: Comunicação instantânea via WebSocket
- **Histórico de Mensagens**: Persistência e recuperação de mensagens anteriores
- **Proteção de Rotas**: Endpoints protegidos por autenticação
- **Interface Responsiva**: Interface moderna e intuitiva


## 🏗️ Arquitetura

O projeto está estruturado como um monorepo com as seguintes partes:

```
real-time-chat-websockets/
├── packages/
│   ├── backend/          # API NestJS + WebSocket
│   └── frontend/         # Aplicação React
├── README.md            # Este arquivo
└── package.json         # Scripts do monorepo
```

## 🛠️ Tecnologias Utilizadas

### Backend (NestJS)
- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT (JSON Web Tokens)
- **WebSocket**: Socket.io
- **Validação**: class-validator
- **Testes**: Jest (Unitários e E2E)

### Frontend (React)
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **WebSocket**: Socket.io Client
- **HTTP Client**: Axios
- **Estado**: React Hooks

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

**Para banco de dados, escolha uma opção:**
- **Opção A**: [PostgreSQL](https://www.postgresql.org/) (versão 12 ou superior) - Instalação local
- **Opção B**: [Docker](https://www.docker.com/) - Container PostgreSQL (recomendado)

## 🚀 Instalação e Execução

### Instalação Rápida

```bash
# Clone e configure tudo automaticamente
git clone https://github.com/seu-usuario/real-time-chat-websockets.git
cd real-time-chat-websockets
npm run setup
```

### Instalação Manual

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/real-time-chat-websockets.git
cd real-time-chat-websockets
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

#### Opção A: PostgreSQL Local

1. Crie um banco PostgreSQL
2. Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cd packages/backend
cp env.example .env
```

3. Configure as variáveis no arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/chat_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"

# App
PORT=3000
```

#### Opção B: Docker (Recomendado)

1. Certifique-se de ter o Docker instalado
2. Execute o comando para subir o banco:

```bash
npm run db:up
```

3. Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cd packages/backend
cp env.example .env
```

4. Configure as variáveis no arquivo `.env` (Docker):

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5435/chat_app?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"

# App
PORT=3000
```

### 4. Execute as migrações do banco

```bash
# Se usando PostgreSQL local
cd packages/backend
npx prisma migrate dev

# Se usando Docker
npm run db:migrate
```

### 5. Gerenciamento do banco (Docker)

```bash
# Subir banco
npm run db:up

# Parar banco
npm run db:down

# Resetar banco (parar, subir e executar migrações)
npm run db:reset

# Abrir Prisma Studio (interface visual)
npm run db:studio
```

### 6. Inicie ambos os serviços

```bash
# Iniciar backend e frontend simultaneamente
npm run dev

# Ou iniciar separadamente:
npm run dev:backend  # Backend em http://localhost:3000
npm run dev:frontend # Frontend em http://localhost:5173
```

## 🎯 Como Usar

### 1. Acesse a aplicação
Abra seu navegador e acesse: `http://localhost:5173`

### 2. Registre-se ou faça login
- **Registro**: Preencha nome, email e senha
- **Login**: Use email e senha já cadastrados

### 3. Crie ou entre em uma sala
- **Criar sala**: Defina nome e limite de usuários
- **Entrar em sala**: Escolha uma sala da lista

### 4. Comece a conversar
- Digite suas mensagens no campo de texto
- Veja mensagens em tempo real
- Observe quando usuários entram ou saem

### 5. Funcionalidades disponíveis
- ✅ Chat em tempo real
- ✅ Histórico de mensagens

- ✅ Interface responsiva
- ✅ Autenticação segura

## 🧪 Testes

### Testes Unitários

```bash
# Executar todos os testes
npm test

# Ou executar separadamente:
npm run test:backend  # Testes do backend
npm run test:frontend # Testes do frontend
```

### Testes E2E

```bash
# Testes E2E do backend
npm run test:e2e
```

## 📚 Documentação da API

### Endpoints de Autenticação

#### POST /auth/register
Registra um novo usuário.

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta (201):**
```json
{
  "id": "user-id",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST /auth/login
Autentica um usuário.

```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "access_token": "jwt-token"
}
```

#### GET /me
Retorna informações do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Resposta (200):**
```json
{
  "id": "user-id",
  "name": "João Silva",
  "email": "joao@example.com"
}
```

### Endpoints de Salas

#### POST /rooms
Cria uma nova sala (protegido).

```json
{
  "name": "Sala Geral",
  "maxUsers": 50
}
```

#### GET /rooms
Lista todas as salas (protegido).

#### GET /rooms/:slug
Obtém uma sala específica (protegido).

### WebSocket Events

**Namespace:** `/chat`

#### Conexão
```javascript
// Conectar com autenticação
const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'jwt-token'
  }
});
```

#### Enviar mensagem
```javascript
socket.emit('message:send', {
  text: 'Olá, pessoal!'
});
```

#### Entrar em sala
```javascript
socket.emit('room:join', {
  roomSlug: 'sala-geral'
});
```

#### Eventos recebidos
```javascript
// Nova mensagem
socket.on('message:new', (message) => {
  console.log('Nova mensagem:', message);
});

// Usuário entrou
socket.on('user:joined', (user) => {
  console.log('Usuário entrou:', user);
});

// Usuário saiu
socket.on('user:left', (user) => {
  console.log('Usuário saiu:', user);
});
```

## 🔧 Scripts Disponíveis

### Monorepo (Raiz)
```bash
npm run dev              # Iniciar backend e frontend
npm run dev:backend      # Apenas backend
npm run dev:frontend     # Apenas frontend
npm run build            # Build de ambos
npm run test             # Testes unitários do backend
npm run test:e2e         # Testes E2E do backend
npm run setup            # Instalação completa

# Banco de dados (Docker)
npm run db:up            # Subir banco PostgreSQL
npm run db:down          # Parar banco PostgreSQL
npm run db:reset         # Resetar banco (parar, subir, migrar)
npm run db:migrate       # Executar migrações
npm run db:studio        # Abrir Prisma Studio
```

### Backend
```bash
cd packages/backend
npm run start:dev        # Desenvolvimento
npm run build            # Build de produção
npm run start:prod       # Produção
npm test                # Testes unitários
npm run test:e2e        # Testes E2E
npm run test:cov        # Cobertura de testes
```

### Frontend
```bash
cd packages/frontend
npm run dev             # Desenvolvimento
npm run build           # Build de produção
npm run preview         # Preview da build
npm test               # Testes
```

## 📁 Estrutura do Projeto

### Backend
```
packages/backend/
├── src/
│   ├── auth/           # Autenticação JWT
│   ├── chat/           # Chat e WebSocket
│   ├── common/         # Filtros, interceptors
│   ├── prisma/         # Configuração do banco
│   └── main.ts         # Entrada da aplicação
├── test/              # Testes E2E
├── prisma/            # Schema e migrações
└── package.json
```

### Frontend
```
packages/frontend/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Serviços de API
│   ├── types/         # Tipos TypeScript
│   └── main.tsx       # Entrada da aplicação
└── package.json
```

## 🐛 Solução de Problemas

### Erro de conexão com banco
- **PostgreSQL Local**: Verifique se o PostgreSQL está rodando
- **Docker**: Execute `npm run db:up` para subir o container
- Confirme as credenciais no arquivo `.env`
- Execute `npm run db:migrate` para criar as tabelas

### Problemas com Docker
- Verifique se o Docker está rodando: `docker --version`
- Se o container não subir: `npm run db:down && npm run db:up`
- Para resetar completamente: `npm run db:reset`

### Erro de CORS
- Verifique se a URL do frontend está correta no `.env`
- Confirme se ambos os serviços estão rodando

### Erro de autenticação
- Verifique se o JWT_SECRET está configurado
- Confirme se o token está sendo enviado corretamente

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Desenvolvedor**: [Seu Nome]
- **Email**: seu-email@example.com
- **LinkedIn**: [Seu Perfil](https://linkedin.com/in/seu-perfil)
- **GitHub**: [@seu-usuario](https://github.com/seu-usuario)

---

**Desenvolvido com ❤️ para o desafio técnico NestJS + React**
