import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from 'src/database/models/comment.model';
import { Post } from 'src/database/models/post.model';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentData, CommentsResult } from 'src/types/comment';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment)
    private readonly commentModel: typeof Comment,
    @InjectModel(Post)
    private readonly postModel: typeof Post,
  ) {}

  private async getCommentDepth(commentId: number): Promise<number> {
    let depth = 0;
    let currentCommentId = commentId;

    while (currentCommentId) {
      const comment = await this.commentModel.findByPk(currentCommentId);
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
    const post = await this.postModel.findByPk(createCommentDto.PostId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (createCommentDto.ParentCommentId) {
      const parentComment = await this.commentModel.findByPk(
        createCommentDto.ParentCommentId,
      );
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

    const comment = await this.commentModel.create({
      ...createCommentDto,
      UserId,
    } as Comment);
    return comment.reload();
  }

  async findAllByPostId(postId: number): Promise<CommentsResult> {
    const post = await this.postModel.findByPk(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.commentModel.findAll({
      where: { PostId: postId },
    });
    return { comments: this.buildCommentTree(comments) };
  }

  async findAll(): Promise<Comment[]> {
    return this.commentModel.findAll();
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentModel.findByPk(id);
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

    await comment.update(updateCommentDto);
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

    await comment.destroy();
  }
}
