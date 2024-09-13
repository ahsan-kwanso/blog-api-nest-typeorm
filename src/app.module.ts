import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database.module';

@Module({
  imports: [
    DatabaseModule, // Add DatabaseModule here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
