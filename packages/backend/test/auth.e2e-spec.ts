import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', () => {
      const registerDto = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Test User');
          expect(res.body).toHaveProperty('email', registerDto.email);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail with invalid email', () => {
      const registerDto = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Email deve ser válido');
        });
    });

    it('should fail with short password', () => {
      const registerDto = {
        name: 'Test User',
        email: `test-short-password-${Date.now()}@example.com`,
        password: '123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Senha deve ter pelo menos 6 caracteres');
        });
    });

    it('should fail with short name', () => {
      const registerDto = {
        name: 'A',
        email: `test-short-name-${Date.now()}@example.com`,
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Nome deve ter pelo menos 2 caracteres');
        });
    });

    it('should fail with duplicate email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      const registerDto = {
        name: 'Test User',
        email: email,
        password: 'password123',
      };

      // Primeiro registro
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Segundo registro com mesmo email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário já existe com este email');
        });
    });
  });

  describe('POST /auth/login', () => {
    let testEmail: string;

    beforeEach(async () => {
      // Criar um usuário para testar login
      testEmail = `login-${Date.now()}@example.com`;
      const registerDto = {
        name: 'Login Test User',
        email: testEmail,
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);
    });

    it('should login successfully with valid credentials', () => {
      const loginDto = {
        email: testEmail,
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
          expect(res.body.access_token.length).toBeGreaterThan(0);
        });
    });

    it('should fail with invalid email', () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário não encontrado');
        });
    });

    it('should fail with incorrect password', () => {
      const loginDto = {
        email: testEmail,
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Senha incorreta');
        });
    });

    it('should fail with invalid email format', () => {
      const loginDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Email deve ser válido');
        });
    });
  });
});
