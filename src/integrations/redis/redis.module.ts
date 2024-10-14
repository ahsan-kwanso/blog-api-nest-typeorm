import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './processors/email.processor';
import { DummyProcessor } from './processors/dummy.processor';
import { DummyResolver } from './dummy.resolver';
import { DummyService } from './dummy.service';
import { BatchEmailProcessor } from './processors/email.batch.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost', // Redis host
        port: 6379, // Redis port
      },
    }),
    BullModule.registerQueue({
      name: 'email', // Name of the queue for email jobs
    }),
    BullModule.registerQueue({
      name: 'dummy', // Queue for dummy tasks
    }),
    BullModule.registerQueue({
      name: 'emailbatch', // for testing in batch
    }),
  ],
  providers: [
    EmailProcessor,
    DummyProcessor,
    DummyResolver,
    DummyService,
    BatchEmailProcessor,
  ],
  exports: [BullModule], // Export BullModule so it can be used in other modules
})
export class RedisModule {}
