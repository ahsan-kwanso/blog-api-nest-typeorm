import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UrlGeneratorService } from 'src/utils/pagination.util';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User])], // user added here as well because we will be sending authorname
  providers: [PostService, UrlGeneratorService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
