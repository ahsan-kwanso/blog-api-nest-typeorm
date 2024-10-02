import { ObjectType, Field, Int } from '@nestjs/graphql';

// Base interface for comment data
@ObjectType()
export class BaseCommentData {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Class for comment including user and post associations
@ObjectType()
export class ActualComment extends BaseCommentData {
  @Field(() => Int)
  PostId: number;

  @Field(() => Int, { nullable: true }) // Optional field for ParentCommentId
  ParentCommentId?: number;

  @Field(() => Int)
  UserId: number;
}

// Class for comment data used in responses
@ObjectType()
export class CommentData extends BaseCommentData {
  @Field(() => Int)
  UserId: number;

  @Field(() => Int)
  PostId: number;

  @Field(() => Int, { nullable: true }) // Optional field for ParentCommentId
  ParentCommentId: number | null;

  @Field(() => [CommentData], { nullable: true }) // Array of subComments
  subComments: CommentData[];
}

// Response type for creating and updating comments
@ObjectType()
export class CommentResponse {
  @Field(() => ActualComment, { nullable: true }) // Nullable comment field
  comment?: ActualComment;

  @Field({ nullable: true }) // Nullable message field
  message?: string;
}

// Response type for getting comments by post ID
@ObjectType()
export class CommentsResult {
  @Field(() => [CommentData], { nullable: true }) // Array of CommentData
  comments?: CommentData[];

  @Field({ nullable: true }) // Nullable message field
  message?: string;
}
