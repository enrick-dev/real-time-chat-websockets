import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não decoradas
      forbidNonWhitelisted: true, // Rejeita requisições com propriedades extras
      transform: true, // Transforma tipos automaticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
