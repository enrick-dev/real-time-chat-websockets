import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Protected Routes (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configurar validação global
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

    // Criar usuário e obter token para testes
    const registerDto = {
      name: 'Protected Routes Test User',
      email: 'protected@example.com',
      password: 'password123',
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'protected@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /me', () => {
    it('should return user profile when authenticated', () => {
      return request(app.getHttpServer())
        .get('/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Protected Routes Test User');
          expect(res.body).toHaveProperty('email', 'protected@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 401 when no token provided', () => {
      return request(app.getHttpServer())
        .get('/me')
        .expect(401);
    });

    it('should return 401 when invalid token provided', () => {
      return request(app.getHttpServer())
        .get('/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 when malformed authorization header', () => {
      return request(app.getHttpServer())
        .get('/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });

  describe('POST /rooms', () => {
    it('should create a room when authenticated', () => {
      const createRoomDto = {
        name: 'Test Room',
        maxUsers: 10,
      };

      return request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRoomDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Test Room');
          expect(res.body).toHaveProperty('slug');
          expect(res.body).toHaveProperty('maxUsers', 10);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should fail with invalid room data', () => {
      const invalidRoomDto = {
        name: 'A', // Muito curto
        maxUsers: 1, // Muito baixo
      };

      return request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRoomDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Nome da sala deve ter pelo menos 2 caracteres');
          expect(res.body.message).toContain('Limite mínimo de usuários é 2');
        });
    });

    it('should return 401 when not authenticated', () => {
      const createRoomDto = {
        name: 'Test Room',
        maxUsers: 10,
      };

      return request(app.getHttpServer())
        .post('/rooms')
        .send(createRoomDto)
        .expect(401);
    });
  });

  describe('GET /rooms', () => {
    beforeEach(async () => {
      // Criar algumas salas para testar
      const createRoomDto = {
        name: 'Test Room 1',
        maxUsers: 10,
      };

      await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRoomDto);
    });

    it('should return list of rooms when authenticated', () => {
      return request(app.getHttpServer())
        .get('/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('slug');
          expect(res.body[0]).toHaveProperty('maxUsers');
          expect(res.body[0]).toHaveProperty('createdAt');
          expect(res.body[0]).toHaveProperty('updatedAt');
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get('/rooms')
        .expect(401);
    });
  });

  describe('GET /rooms/:slug', () => {
    let roomSlug: string;

    beforeEach(async () => {
      // Criar uma sala para testar
      const createRoomDto = {
        name: 'Specific Test Room',
        maxUsers: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRoomDto);

      roomSlug = response.body.slug;
    });

    it('should return room by slug when authenticated', () => {
      return request(app.getHttpServer())
        .get(`/rooms/${roomSlug}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Specific Test Room');
          expect(res.body).toHaveProperty('slug', roomSlug);
          expect(res.body).toHaveProperty('maxUsers', 5);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 404 for non-existent room', () => {
      return request(app.getHttpServer())
        .get('/rooms/non-existent-room')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get(`/rooms/${roomSlug}`)
        .expect(401);
    });
  });
});
