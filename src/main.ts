import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exctption.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 3000;
  await app.listen(PORT);
  console.log(`Сервер запущен на порту ${PORT}`);
}
bootstrap();
