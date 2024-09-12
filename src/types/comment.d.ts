import { Optional } from 'sequelize';

// Base interface for comment data
export interface BaseCommentData {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for comment including user and post associations
export interface Comment extends BaseCommentData {
  PostId: number;
  ParentCommentId?: number;
  UserId: number;
}

// Interface for comment data used in responses
export interface CommentData extends BaseCommentData {
  UserId: number;
  PostId: number;
  ParentCommentId: number | null;
  subComments: CommentData[];
}

// Response type for creating and updating comments
export interface CommentResponse {
  comment?: Comment; // Reuse the Comment interface here
  message?: string;
}

// Response type for getting comments by post ID
export interface CommentsResult {
  comments?: CommentData[]; // Reuse the CommentData interface here
  message?: string;
}
