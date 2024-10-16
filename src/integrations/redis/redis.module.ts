import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { DummyProcessor } from './processors/dummy.processor';
import { DummyResolver } from './dummy.resolver';
import { DummyService } from './dummy.service';
import { BatchEmailProcessor } from './processors/email.batch.processor';
import {
  BATCH_EMAIL_PROCESSOR_QUEUE,
  DUMMY_PROCESSOR_QUEUE,
  EMAIL_PROCESSOR_QUEUE,
} from 'src/utils/constants';
import { JobProgressResolver } from './job.progress.resolver';
import { JobsProgressService } from './job.progress.service';
import { RedisService } from './redis.service';
import { EmailModule } from '../sg/email.module';

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
      name: EMAIL_PROCESSOR_QUEUE, // Name of the queue for email jobs // //specify these in envs
    }),
    BullModule.registerQueue({
      name: DUMMY_PROCESSOR_QUEUE, // Queue for dummy tasks
    }),
    BullModule.registerQueue({
      name: BATCH_EMAIL_PROCESSOR_QUEUE, // for testing in batch
    }),
    EmailModule,
  ],
  providers: [
    EmailProcessor,
    DummyProcessor,
    DummyResolver,
    DummyService,
    BatchEmailProcessor,
    JobProgressResolver,
    JobsProgressService,
    RedisService,
  ],
  exports: [BullModule, RedisService], // Export BullModule so it can be used in other modules
})
export class RedisModule {}
