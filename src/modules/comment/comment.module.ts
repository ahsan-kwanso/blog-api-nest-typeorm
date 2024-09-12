import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from 'src/database/models/comment.model';
import { Post } from 'src/database/models/post.model';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

@Module({
  imports: [SequelizeModule.forFeature([Comment, Post])],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
