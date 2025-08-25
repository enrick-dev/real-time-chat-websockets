# Backend - Chat em Tempo Real

API REST e WebSocket desenvolvida em NestJS para o sistema de chat em tempo real.

## 🏗️ Arquitetura

O backend é construído com NestJS e utiliza:

- **Framework**: NestJS com TypeScript
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT (JSON Web Tokens)
- **WebSocket**: Socket.io para comunicação em tempo real
- **Validação**: class-validator e class-transformer
- **Testes**: Jest para testes unitários e E2E

## 📁 Estrutura do Projeto

```
src/
├── auth/                    # Módulo de autenticação
│   ├── auth.controller.ts   # Controlador de auth
│   ├── auth.service.ts      # Serviço de auth
│   ├── auth.module.ts       # Módulo de auth
│   ├── dto/                 # DTOs de validação
│   ├── guards/              # Guards JWT
│   └── strategies/          # Estratégias JWT
├── chat/                    # Módulo de chat
│   ├── chat.gateway.ts      # Gateway WebSocket
│   ├── chat.service.ts      # Serviço de chat
│   ├── chat.module.ts       # Módulo de chat
│   ├── room.controller.ts   # Controlador de salas
│   ├── room.service.ts      # Serviço de salas
│   ├── dto/                 # DTOs de validação
│   └── guards/              # Guards WebSocket
├── common/                  # Utilitários comuns
│   ├── constants/           # Constantes
│   ├── filters/             # Filtros de exceção
│   ├── interceptors/        # Interceptors
│   └── services/            # Serviços comuns
├── prisma/                  # Configuração Prisma
│   ├── prisma.module.ts     # Módulo Prisma
│   └── prisma.service.ts    # Serviço Prisma
└── main.ts                  # Entrada da aplicação
```

## 🚀 Instalação e Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp env.example .env
```

Configure as variáveis:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/chat_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"

# App
PORT=3000
```

### 3. Configurar banco de dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# (Opcional) Visualizar dados
npx prisma studio
```

### 4. Executar a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Autenticação

#### POST /auth/register
Registra um novo usuário.

**Body:**
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

**Validações:**
- `name`: mínimo 2 caracteres, máximo 50
- `email`: formato válido de email
- `password`: mínimo 6 caracteres, máximo 100

#### POST /auth/login
Autentica um usuário.

**Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:**
- `401`: Usuário não encontrado
- `401`: Senha incorreta

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

### Salas

#### POST /rooms
Cria uma nova sala (protegido).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Sala Geral",
  "maxUsers": 50
}
```

**Resposta (201):**
```json
{
  "id": "room-id",
  "name": "Sala Geral",
  "slug": "sala-geral",
  "maxUsers": 50,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Validações:**
- `name`: mínimo 2 caracteres, máximo 50
- `maxUsers`: mínimo 2, máximo 100

#### GET /rooms
Lista todas as salas (protegido).

**Headers:** `Authorization: Bearer <token>`

**Resposta (200):**
```json
[
  {
    "id": "room-id",
    "name": "Sala Geral",
    "slug": "sala-geral",
    "maxUsers": 50,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /rooms/:slug
Obtém uma sala específica (protegido).

**Headers:** `Authorization: Bearer <token>`

**Resposta (200):**
```json
{
  "id": "room-id",
  "name": "Sala Geral",
  "slug": "sala-geral",
  "maxUsers": 50,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros:**
- `404`: Sala não encontrada

## 🔌 WebSocket API

### Conexão

**Namespace:** `/chat`

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'jwt-token'
  }
});
```

### Eventos do Cliente

#### room:join
Entra em uma sala específica.

```javascript
socket.emit('room:join', {
  roomSlug: 'sala-geral'
});
```

**Resposta:**
```javascript
socket.on('room:join', (data) => {
  console.log('Sala:', data.room);
  console.log('Mensagens:', data.messages);
});
```

#### message:send
Envia uma mensagem para a sala atual.

```javascript
socket.emit('message:send', {
  text: 'Olá, pessoal!'
});
```

#### message:list
Solicita lista de mensagens (deprecated, use room:join).

```javascript
socket.emit('message:list');
```

### Eventos do Servidor

#### message:new
Nova mensagem recebida.

```javascript
socket.on('message:new', (message) => {
  console.log('Nova mensagem:', {
    id: message.id,
    text: message.text,
    userId: message.userId,
    userName: message.userName,
    createdAt: message.createdAt
  });
});
```

#### user:joined
Usuário entrou na sala.

```javascript
socket.on('user:joined', (user) => {
  console.log('Usuário entrou:', {
    userId: user.userId,
    userName: user.userName,
    timestamp: user.timestamp
  });
});
```

#### user:left
Usuário saiu da sala.

```javascript
socket.on('user:left', (user) => {
  console.log('Usuário saiu:', {
    userId: user.userId,
    userName: user.userName,
    timestamp: user.timestamp
  });
});
```

#### error
Erro na operação.

```javascript
socket.on('error', (error) => {
  console.error('Erro:', error);
});
```

## 🧪 Testes

### Testes Unitários

```bash
# Executar todos os testes
npm test

# Executar com coverage
npm run test:cov

# Executar em modo watch
npm run test:watch
```

**Cobertura de testes:**
- AuthService: registro, login, validação de usuário
- RoomService: criação, busca, listagem de salas
- ChatService: criação e busca de mensagens

### Testes E2E

```bash
# Executar testes E2E
npm run test:e2e

# Executar com coverage
npm run test:e2e:cov
```

**Testes E2E incluídos:**
- Autenticação: registro, login, validação
- Rotas protegidas: criação e acesso a salas
- Validação de dados: DTOs e mensagens de erro

### Exemplo de Teste

```typescript
describe('AuthService', () => {
  it('should register a new user successfully', async () => {
    const registerDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const result = await service.register(registerDto);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(registerDto.name);
    expect(result.email).toBe(registerDto.email);
  });
});
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev      # Servidor de desenvolvimento
npm run start:debug    # Modo debug
npm run start:prod     # Produção

# Build
npm run build          # Compilar TypeScript
npm run build:webpack  # Build com webpack

# Testes
npm test              # Testes unitários
npm run test:watch    # Testes em modo watch
npm run test:cov      # Cobertura de testes
npm run test:debug    # Testes em modo debug
npm run test:e2e      # Testes E2E
npm run test:e2e:cov  # Cobertura E2E

# Banco de dados
npx prisma generate    # Gerar cliente Prisma
npx prisma migrate dev # Executar migrações
npx prisma studio     # Interface visual do banco
npx prisma db seed    # Popular banco com dados de teste
```

## 📊 Banco de Dados

### Schema Prisma

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  messages Message[]
}

model Room {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  maxUsers  Int      @default(50)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  messages Message[]
}

model Message {
  id        String   @id @default(cuid())
  text      String
  userId    String
  userName  String
  roomId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  room Room @relation(fields: [roomId], references: [id])
}
```

### Migrações

```bash
# Criar nova migração
npx prisma migrate dev --name add_user_table

# Aplicar migrações em produção
npx prisma migrate deploy

# Resetar banco (desenvolvimento)
npx prisma migrate reset
```

## 🔒 Segurança

### Autenticação JWT

- **Algoritmo**: HS256
- **Expiração**: Configurável via JWT_SECRET
- **Refresh**: Implementação futura

### Validação de Dados

- **DTOs**: Validação com class-validator
- **Sanitização**: Remoção de dados não permitidos
- **Rate Limiting**: Implementação futura

### CORS

```typescript
// Configuração CORS
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

## 📝 Logs

O sistema utiliza o logger integrado do NestJS com diferentes níveis:

- **ERROR**: Erros críticos
- **WARN**: Avisos importantes
- **LOG**: Informações gerais
- **DEBUG**: Informações detalhadas

### Exemplo de Log

```typescript
this.logger.log(`User ${user.email} logged in successfully`, 'AuthService.login');
this.logger.debug(`JWT token generated for user: ${user.email}`, 'AuthService.login');
```

## 🚀 Deploy

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Variáveis de Produção

```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_EXPIRES_IN="24h"
PORT=3000
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Implemente suas mudanças
4. Adicione testes
5. Execute os testes: `npm test && npm run test:e2e`
6. Commit suas mudanças
7. Abra um Pull Request

---

**Backend desenvolvido com NestJS para o sistema de chat em tempo real**
