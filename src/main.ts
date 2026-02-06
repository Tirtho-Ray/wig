import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { SeederService } from './core/seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const seeder = app.get(SeederService);
  await seeder.seedAdmin();

  app.getHttpAdapter().getInstance().set('trust proxy', true);
  // main.ts
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  // Middleware
  app.use(cookieParser());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 9000;

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Backend API')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });;



  console.log(`Project is running on http://localhost:${port}/docs`);
  await app.listen(port);
}
bootstrap();