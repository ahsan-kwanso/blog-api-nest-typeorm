import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from 'src/database/entities/comment.entity';
import { Post } from 'src/database/entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentData, CommentsResult } from 'src/types/comment';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  private async getCommentDepth(commentId: number): Promise<number> {
    let depth = 0;
    let currentCommentId = commentId;

    while (currentCommentId) {
      const comment = await this.commentRepository.findOne({
        where: { id: currentCommentId },
      });
      if (!comment || !comment.ParentCommentId) {
        break;
      }
      currentCommentId = comment.ParentCommentId;
      depth += 1;
    }

    return depth;
  }

  private buildCommentTree(comments: Comment[]): CommentData[] {
    const commentMap: { [key: number]: CommentData } = {};
    const rootComments: CommentData[] = [];

    // Create a map for all comments
    comments.forEach((comment) => {
      commentMap[comment.id] = {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        UserId: comment.UserId,
        PostId: comment.PostId,
        ParentCommentId: comment.ParentCommentId ?? null,
        subComments: [], // Initialize subComments as an empty array
      };
    });

    // Link child comments to their parent comments
    comments.forEach((comment) => {
      if (comment.ParentCommentId) {
        const parentComment = commentMap[comment.ParentCommentId];
        if (parentComment) {
          parentComment.subComments.push(commentMap[comment.id]);
        }
      } else {
        // Add root comments (comments without ParentId) to rootComments array
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  }

  async create(
    createCommentDto: CreateCommentDto,
    UserId: number,
  ): Promise<Comment> {
    const post = await this.postRepository.findOne({
      where: { id: createCommentDto.PostId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (createCommentDto.ParentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.ParentCommentId },
      });
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      if (parentComment.PostId !== createCommentDto.PostId) {
        throw new ForbiddenException('Comment is not on the specified post');
      }
      // Calculate the depth of the comment thread
      const depth = await this.getCommentDepth(
        createCommentDto.ParentCommentId,
      );
      if (depth >= 2) {
        createCommentDto.ParentCommentId = parentComment.ParentCommentId; // Set ParentId to the upper parent comment if depth is 3 or more
      }
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      UserId,
    });
    await this.commentRepository.save(comment);
    return comment;
  }

  async findAllByPostId(postId: number): Promise<CommentsResult> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.commentRepository.find({
      where: { PostId: postId },
    });
    return { comments: this.buildCommentTree(comments) };
  }

  async findAll(): Promise<Comment[]> {
    return await this.commentRepository.find();
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    UserId: number,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    // Check if the user owns the comment
    if (comment.UserId !== UserId) {
      throw new ForbiddenException(
        'You do not have permission to update this comment',
      );
    }

    Object.assign(comment, updateCommentDto);
    await this.commentRepository.save(comment);
    return comment;
  }

  async remove(id: number, UserId: number): Promise<void> {
    const comment = await this.findOne(id);

    // Check if the user owns the comment
    if (comment.UserId !== UserId) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    await this.commentRepository.remove(comment);
  }
}
