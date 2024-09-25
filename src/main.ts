import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './utils/http-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService); // Get the ConfigService instance
  const port = configService.get<number>('PORT') || 3000; // Retrieve the port, fallback to 3000 if not defined

  app.enableCors({
    origin: configService.get('APP_URL'), // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent across domains
  });
  app.use(cookieParser()); // Add cookie-parser middleware
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // Not Automatically strip out properties not in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are provided
      transform: true, // Automatically transform input to match the expected types
    }),
  );

  await app.listen(port); // Use the dynamic port
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
