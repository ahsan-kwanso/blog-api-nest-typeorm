import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './comment.entity';
import { LoggedInUserId } from 'src/common/LoggedInUserId.decorator';
import { CommentsResult } from './dto/comment.dto';
import { Message } from 'src/common/message.dto';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Mutation(() => Message)
  async createComment(
    @Args('createCommentDto') createCommentDto: CreateCommentDto,
    @LoggedInUserId() userId: number,
  ): Promise<Message> {
    await this.commentService.create(createCommentDto, userId);
    return { message: 'Comment Created' };
  }

  @Query(() => [Comment])
  async findAllComments(): Promise<Comment[]> {
    return await this.commentService.findAll();
  }

  @Query(() => CommentsResult)
  async findCommentsOnPost(
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<CommentsResult> {
    return await this.commentService.findAllByPostId(postId);
  }

  @Query(() => Comment)
  async findOneComment(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Comment> {
    return await this.commentService.findOne(id);
  }

  @Mutation(() => Message)
  async updateComment(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateCommentDto') updateCommentDto: UpdateCommentDto,
    @LoggedInUserId() userId: number,
  ): Promise<Message> {
    return {
      message: await this.commentService.update(id, updateCommentDto, userId),
    };
  }

  @Mutation(() => Message)
  async removeComment(
    @Args('id', { type: () => Int }) id: number,
    @LoggedInUserId() userId: number,
  ): Promise<Message> {
    return { message: await this.commentService.remove(id, userId) };
  }
}
