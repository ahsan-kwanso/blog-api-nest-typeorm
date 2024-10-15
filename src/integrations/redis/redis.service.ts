import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = +this.configService.get<number>('REDIS_PORT')!;

    this.redisClient = new Redis({
      host,
      port,
    });
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  // Method to associate postId with jobIds
  async associatePostWithJobs(postId: number, jobIds: string[]) {
    await this.redisClient.sadd(`post:${postId}:jobs`, ...jobIds);
  }

  // Method to get jobIds by postId
  async getJobsByPostId(postId: number): Promise<string[]> {
    return await this.redisClient.smembers(`post:${postId}:jobs`);
  }

  // Method to remove postId-job association (if needed)
  async removePostJobAssociation(postId: number) {
    await this.redisClient.del(`post:${postId}:jobs`);
  }
}
