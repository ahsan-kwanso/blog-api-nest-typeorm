import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { DummyProcessor } from './processors/dummy.processor';
import { DummyResolver } from './dummy.resolver';
import { DummyService } from './dummy.service';
import { BatchEmailProcessor } from './processors/email.batch.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'), // Use your env variable
          port: +configService.get<number>('REDIS_PORT')!, // Convert to number
        },
      }),
      inject: [ConfigService],
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
