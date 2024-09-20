import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './utils/http-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService); // Get the ConfigService instance
  const port = configService.get<number>('PORT') || 3000; // Retrieve the port, fallback to 3000 if not defined

  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port); // Use the dynamic port
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
