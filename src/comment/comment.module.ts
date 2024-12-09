import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comment/comment.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PostModule } from 'src/post/post.module';
import { CommentResolver } from './comment.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), PostModule],
  providers: [CommentService, CommentResolver],
  controllers: [CommentController],
})
export class CommentModule {}
