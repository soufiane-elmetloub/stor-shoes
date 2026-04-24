import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Serve static uploads — absolute path works on any host
  const uploadsPath = process.env.UPLOADS_PATH
    ? path.resolve(process.env.UPLOADS_PATH)
    : path.join(__dirname, '..', '..', '..', '..', 'uploads');

  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

  // CORS — allow localhost (dev) + Vercel storefront (prod)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    ...(process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : []),
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('StorShoes API')
    .setDescription('API for StorShoes E-commerce Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Railway injects PORT dynamically — must use process.env.PORT
  const port = process.env.PORT || process.env.API_PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 StorShoes API running on port ${port}`);
  console.log(`📚 Swagger docs available at /api/docs`);
}
bootstrap();
