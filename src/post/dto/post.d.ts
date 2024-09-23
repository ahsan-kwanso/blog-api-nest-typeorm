export interface PostAttributes {
  id: number;
  title: string;
  content: string;
  UserId: number;
}

// Common Post type
export interface Post extends PostAttributes {
  createdAt?: Date;
  updatedAt: Date;
}

// Post with User
interface PostWithUser extends Post {
  User?: {
    name: string;
  };
}

// Post Response
interface PostResponse {
  id: number;
  author?: string; // Represents the user's name
  title: string;
  content: string;
  date: string; // Formatted date as YYYY-MM-DD
}

// Error Response
interface ErrorResponse {
  success: false;
  message: string;
}

// Paginated Posts Response
// generic for this like pass data
interface PaginatedPostsResponse {
  success?: boolean;
  posts: PostResponse[];
  total: number;
  page?: number;
  pageSize?: number;
  nextPage: string | null;
}

// Define interfaces for service results
interface PostResult {
  success: boolean;
  message?: string;
  post?: Post; // Use the Post type here
}

interface PostsResult {
  success?: boolean; // Made optional
  message?: string; // Made optional
  total?: number;
  page?: number;
  pageSize?: number;
  nextPage?: string | null;
  posts?: Post[]; // Use the Post type here
}
