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
  async associatePostWithJobs(
    postId: number,
    jobIds: string[],
    ttlInSeconds: number = 86400,
  ) {
    const redisKey = `post:${postId}:jobs`;

    // Add the jobIds to the Redis set
    await this.redisClient.sadd(redisKey, ...jobIds);

    // Set a TTL (Time-to-Live) for the key, default is 24 hours (86400 seconds)
    await this.redisClient.expire(redisKey, ttlInSeconds);
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
