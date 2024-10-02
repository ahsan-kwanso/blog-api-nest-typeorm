import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UrlGeneratorService } from 'src/utils/pagination.util';
import { JwtModule } from 'src/utils/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), JwtModule],
  providers: [PostService, UrlGeneratorService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
