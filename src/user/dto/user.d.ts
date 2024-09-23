export interface UserWithNumberOfPosts {
  id: number;
  name: string;
  email: string;
  role: string;
  posts: number;
}

export interface PaginatedUserWithNumberOfPosts {
  users: UserWithNumberOfPosts[];
  total: number;
  page?: number;
  pageSize?: number;
  nextPage: string | null;
}
