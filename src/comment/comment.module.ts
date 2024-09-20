import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/database/entities/comment.entity';
import { Post } from 'src/database/entities/post.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post])],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
