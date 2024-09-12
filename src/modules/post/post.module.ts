import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/database/models/post.model';
import { User } from 'src/database/models/user.model';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UrlGeneratorService } from 'src/utils/pagination.util';

@Module({
  imports: [SequelizeModule.forFeature([Post, User])], // user added here as well because we will be sending authorname
  providers: [PostService, UrlGeneratorService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
