import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UrlGeneratorService } from 'src/utils/pagination.util';
import { JwtModule } from 'src/utils/jwt.module';
import { PostResolver } from './post.resolver';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/integrations/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    JwtModule,
    UserModule,
    RedisModule,
  ],
  providers: [PostService, UrlGeneratorService, PostResolver],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
