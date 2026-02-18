import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Apply global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('M-Verse API')
    .setDescription('Documentation de l\'API M-Verse')
    .setVersion('1.0')
    .addTag('Authentication', 'Endpoints for user authentication and management')
    .addTag('Collection', 'Endpoints for managing user media collection')
    .addTag('Log', 'Endpoints for managing activity logs')
    .addTag('List', 'Endpoints for managing media lists and collections')
    .addTag('Search', 'Endpoints for searching media using external APIs like TMDB')
    .addTag('Stats', 'Endpoints for retrieving user statistics and insights')
    .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'JWT-authorization',)
    .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory, {
      swaggerOptions: {
        defaultModelsExpandDepth: 3
      },
    });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
