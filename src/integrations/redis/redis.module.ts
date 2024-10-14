import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './processors/email.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',  // Replace with your Redis host
        port: 6379,         // Replace with your Redis port if necessary
      },
    }),
    BullModule.registerQueue({
      name: 'email',        // Name of the queue for email jobs
    }),
  ],
  providers: [EmailProcessor],
  exports: [BullModule],     // Export BullModule so it can be used in other modules
})
export class RedisModule {}
