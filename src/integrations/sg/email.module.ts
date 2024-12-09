// src/email/email.module.ts
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { SendGridProvider } from './email.provider';

@Module({
  imports: [ConfigModule], // Import ConfigModule
  providers: [EmailService, SendGridProvider],
  exports: [EmailService],
})
export class EmailModule {}
