# Frontend - Chat em Tempo Real

Interface de usuário desenvolvida em React para o sistema de chat em tempo real.

## 🏗️ Arquitetura

O frontend é construído com React e utiliza:

- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite para desenvolvimento rápido
- **Styling**: Tailwind CSS para estilização
- **WebSocket**: Socket.io Client para comunicação em tempo real
- **HTTP Client**: Axios para requisições REST
- **Estado**: React Hooks (useState, useEffect, useContext)
- **Roteamento**: React Router (futuro)

## 📁 Estrutura do Projeto

```
src/
├── components/              # Componentes React
│   ├── Auth/               # Componentes de autenticação
│   │   ├── LoginForm.tsx   # Formulário de login
│   │   └── RegisterForm.tsx # Formulário de registro
│   ├── Chat/               # Componentes de chat
│   │   └── ChatRoom.tsx    # Sala de chat
│   └── Room/               # Componentes de salas
│       ├── CreateRoom.tsx  # Criação de salas
│       └── RoomList.tsx    # Lista de salas
├── pages/                  # Páginas da aplicação
│   └── AuthPage.tsx        # Página de autenticação
├── services/               # Serviços de API
│   ├── authService.ts      # Serviço de autenticação
│   └── roomService.ts      # Serviço de salas
├── types/                  # Tipos TypeScript
│   ├── chat.ts            # Tipos do chat
│   └── room.ts            # Tipos das salas
├── assets/                 # Recursos estáticos
├── App.tsx                 # Componente principal
├── main.tsx               # Entrada da aplicação
└── index.css              # Estilos globais
```

## 🚀 Instalação e Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

### 3. Executar a aplicação

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview
```

## 🎨 Componentes

### AuthPage
Página principal de autenticação que alterna entre login e registro.

**Funcionalidades:**
- Alternância entre formulários de login e registro
- Validação de campos em tempo real
- Redirecionamento após autenticação bem-sucedida
- Tratamento de erros de autenticação

**Uso:**
```tsx
<AuthPage />
```

### LoginForm
Formulário de login com validação.

**Props:**
- `onLogin`: Callback executado após login bem-sucedido
- `onSwitchToRegister`: Callback para alternar para registro

**Campos:**
- Email (obrigatório, formato válido)
- Senha (obrigatória, mínimo 1 caractere)

**Uso:**
```tsx
<LoginForm 
  onLogin={(token) => console.log('Logado:', token)}
  onSwitchToRegister={() => setMode('register')}
/>
```

### RegisterForm
Formulário de registro com validação.

**Props:**
- `onRegister`: Callback executado após registro bem-sucedido
- `onSwitchToLogin`: Callback para alternar para login

**Campos:**
- Nome (obrigatório, mínimo 2 caracteres, máximo 50)
- Email (obrigatório, formato válido)
- Senha (obrigatória, mínimo 6 caracteres, máximo 100)

**Uso:**
```tsx
<RegisterForm 
  onRegister={(user) => console.log('Registrado:', user)}
  onSwitchToLogin={() => setMode('login')}
/>
```

### ChatRoom
Componente principal do chat em tempo real.

**Funcionalidades:**
- Conexão WebSocket com autenticação
- Envio e recebimento de mensagens em tempo real
- Histórico de mensagens

- Interface responsiva

**Props:**
- `roomSlug`: Slug da sala para conectar
- `user`: Informações do usuário autenticado

**Uso:**
```tsx
<ChatRoom 
  roomSlug="sala-geral"
  user={{ id: 'user-id', name: 'João Silva' }}
/>
```

### CreateRoom
Formulário para criação de novas salas.

**Funcionalidades:**
- Validação de campos
- Integração com API REST
- Feedback visual de sucesso/erro

**Campos:**
- Nome da sala (obrigatório, mínimo 2 caracteres, máximo 50)
- Limite de usuários (obrigatório, mínimo 2, máximo 100)

**Uso:**
```tsx
<CreateRoom onRoomCreated={(room) => console.log('Sala criada:', room)} />
```

### RoomList
Lista de salas disponíveis.

**Funcionalidades:**
- Carregamento de salas da API
- Navegação para salas
- Interface responsiva

**Uso:**
```tsx
<RoomList onRoomSelect={(room) => navigateToRoom(room.slug)} />
```

## 🔌 Serviços

### AuthService
Serviço para operações de autenticação.

**Métodos:**
```typescript
// Registro de usuário
register(data: RegisterData): Promise<User>

// Login de usuário
login(data: LoginData): Promise<{ access_token: string }>

// Obter informações do usuário
getMe(): Promise<User>

// Armazenar token
setToken(token: string): void

// Obter token
getToken(): string | null

// Remover token (logout)
removeToken(): void
```

**Uso:**
```typescript
import { authService } from '../services/authService';

// Registrar usuário
const user = await authService.register({
  name: 'João Silva',
  email: 'joao@example.com',
  password: 'senha123'
});

// Fazer login
const { access_token } = await authService.login({
  email: 'joao@example.com',
  password: 'senha123'
});

// Armazenar token
authService.setToken(access_token);
```

### RoomService
Serviço para operações com salas.

**Métodos:**
```typescript
// Criar sala
createRoom(data: CreateRoomData): Promise<Room>

// Listar salas
getRooms(): Promise<Room[]>

// Obter sala por slug
getRoomBySlug(slug: string): Promise<Room>
```

**Uso:**
```typescript
import { roomService } from '../services/roomService';

// Criar sala
const room = await roomService.createRoom({
  name: 'Sala Geral',
  maxUsers: 50
});

// Listar salas
const rooms = await roomService.getRooms();
```

## 🔌 WebSocket

### Conexão
```typescript
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_WS_URL + '/chat', {
  auth: {
    token: authService.getToken()
  }
});
```

### Eventos

**Enviar mensagem:**
```typescript
socket.emit('message:send', {
  text: 'Olá, pessoal!'
});
```

**Entrar em sala:**
```typescript
socket.emit('room:join', {
  roomSlug: 'sala-geral'
});
```

**Receber mensagens:**
```typescript
socket.on('message:new', (message) => {
  console.log('Nova mensagem:', message);
  // Atualizar estado das mensagens
});

socket.on('user:joined', (user) => {
  console.log('Usuário entrou:', user);
  // Atualizar lista de usuários
});

socket.on('user:left', (user) => {
  console.log('Usuário saiu:', user);
  // Atualizar lista de usuários
});
```

## 🎨 Estilização

### Tailwind CSS
O projeto utiliza Tailwind CSS para estilização com classes utilitárias.

**Configuração:**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        }
      }
    },
  },
  plugins: [],
}
```

**Exemplo de uso:**
```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">
    Chat em Tempo Real
  </h2>
  <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
    Enviar Mensagem
  </button>
</div>
```

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:

- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado
- **Mobile**: Layout otimizado para telas pequenas

### Breakpoints
```css
/* Mobile First */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

## 🔒 Autenticação

### Fluxo de Autenticação

1. **Registro/Login**: Usuário preenche formulário
2. **Validação**: Campos são validados no frontend
3. **Requisição**: Dados enviados para API
4. **Token**: JWT recebido e armazenado
5. **Redirecionamento**: Usuário direcionado para chat

### Armazenamento de Token

```typescript
// Armazenar token
localStorage.setItem('auth_token', token);

// Recuperar token
const token = localStorage.getItem('auth_token');

// Remover token (logout)
localStorage.removeItem('auth_token');
```

### Proteção de Rotas

```typescript
// Verificar se usuário está autenticado
const isAuthenticated = () => {
  return authService.getToken() !== null;
};

// Redirecionar se não autenticado
if (!isAuthenticated()) {
  // Redirecionar para login
}
```

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

### Estrutura de Testes

```
src/
├── __tests__/              # Testes
│   ├── components/         # Testes de componentes
│   ├── services/          # Testes de serviços
│   └── utils/             # Testes de utilitários
```

### Exemplo de Teste

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../components/Auth/LoginForm';

describe('LoginForm', () => {
  it('should validate required fields', () => {
    const mockOnLogin = jest.fn();
    const mockOnSwitchToRegister = jest.fn();

    render(
      <LoginForm 
        onLogin={mockOnLogin}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    const submitButton = screen.getByText('Entrar');
    fireEvent.click(submitButton);

    expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
  });
});
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview da build

# Testes
npm test            # Testes unitários
npm run test:watch  # Testes em modo watch
npm run test:coverage # Cobertura de testes

# Linting
npm run lint        # Verificar código
npm run lint:fix    # Corrigir problemas automaticamente
```

## 📦 Build e Deploy

### Build de Produção

```bash
npm run build
```

O build será gerado na pasta `dist/` com:
- JavaScript otimizado
- CSS minificado
- Assets otimizados
- Source maps (opcional)

### Deploy

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# Fazer upload da pasta dist/
```

**Docker:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🐛 Solução de Problemas

### Erro de CORS
- Verifique se a URL da API está correta no `.env`
- Confirme se o backend está configurado para aceitar requisições do frontend

### Erro de WebSocket
- Verifique se o backend está rodando
- Confirme se o token JWT está sendo enviado corretamente
- Verifique se a URL do WebSocket está correta

### Erro de Build
- Limpe o cache: `npm run clean`
- Reinstale dependências: `rm -rf node_modules && npm install`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Implemente suas mudanças
4. Adicione testes se necessário
5. Execute os testes: `npm test`
6. Commit suas mudanças
7. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Frontend desenvolvido com React para o sistema de chat em tempo real**
