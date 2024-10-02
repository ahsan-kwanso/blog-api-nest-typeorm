import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comment/comment.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PostModule } from 'src/post/post.module';
import { EmailModule } from 'src/integrations/sg/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), PostModule, EmailModule],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
