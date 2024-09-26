import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { Post } from 'src/post/post.entity';
import { UrlGeneratorService } from 'src/utils/pagination.util';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatedPostsResponse, PostResponse } from './dto/post';
import paginationConfig from 'src/utils/pagination.config';
import { Role } from 'src/user/dto/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationQueryDto } from 'src/common/pagination.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly urlGeneratorService: UrlGeneratorService,
  ) {}

  async create(createPostDto: CreatePostDto, UserId: number): Promise<Post> {
    try {
      // Create a new instance of the Post entity
      const post = this.postRepository.create({
        ...createPostDto,
        UserId, // Attach the userId from the request (decoded JWT)
      });

      // Save the new post to the database
      return await this.postRepository.save(post);
    } catch (error) {
      throw new ConflictException('Failed to create post');
    }
  }

  async findAll(): Promise<Post[]> {
    return await this.postRepository.find();
  }

  async getPosts(
    filter: string,
    userId: number,
    paginationQuery: PaginationQueryDto,
    req: ExpressRequest,
  ) {
    // If 'filter' is 'my-posts', ensure the user is authenticated and matches userId
    if (filter === 'my-posts') {
      if (!req.user) {
        throw new ForbiddenException('Authentication is required');
      }

      // Ensure the authenticated user matches the userId in the query
      if (userId !== req.user.id) {
        throw new ForbiddenException('You do not have permissions');
      }

      // Fetch posts specific to the user
      return await this.getMyPosts(req.user.id, paginationQuery, req);
    }

    // For non-'my-posts', fetch public posts
    return await this.getPublicPosts(paginationQuery, req);
  }

  async getMyPosts(
    userId: number,
    paginationQuery: PaginationQueryDto,
    req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    // Fetch and return posts by userId
    return await this.fetchPosts(userId, paginationQuery, req);
  }

  async getPublicPosts(
    paginationQuery: PaginationQueryDto,
    req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    // Fetch and return public posts
    return await this.fetchPosts(null, paginationQuery, req);
  }

  private async fetchPosts(
    userId: number | null,
    paginationQuery: PaginationQueryDto,
    req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    const pageSize = paginationQuery.limit;
    const pageNumber = paginationQuery.page;
    // Define a base query, use query builder less
    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user') // Eager load the user relation
      .orderBy('post.createdAt', 'DESC')
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    // Add user filtering if applicable
    if (userId) {
      query.where('post.UserId = :userId', { userId });
    }

    // Execute the query and get paginated posts
    const [posts, total] = await query.getManyAndCount();
    // Map posts to the required format
    const formattedPosts: PostResponse[] = posts.map((post) => ({
      id: post.id,
      author: post.user?.name, // Access the user's name
      title: post.title,
      content: post.content,
      date: post.updatedAt, // Format date as YYYY-MM-DD, just format on frontend
    }));

    // Calculate pagination details
    const totalPages = Math.ceil(total / pageSize);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    return {
      posts: formattedPosts,
      total,
      page: pageNumber,
      pageSize: pageSize,
      nextPage: this.urlGeneratorService.generateNextPageUrl(
        nextPage,
        pageSize,
        req,
      ), // Use the UrlGeneratorService
    };
  }

  async searchPosts(
    title: string,
    page: number = paginationConfig.defaultPage,
    limit: number = paginationConfig.defaultLimit,
    req: ExpressRequest,
    filter?: string, // Filter to differentiate between all posts and my-posts
    userId?: number, // Optional userId for filtering user-specific posts
  ): Promise<PaginatedPostsResponse> {
    const pageSize = Number(limit);
    const pageNumber = Number(page);

    // Initialize query builder to search posts by title
    const queryBuilder: SelectQueryBuilder<Post> = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user') // Eager load the user relation
      .where('post.title ILIKE :title', { title: `%${title}%` }); // Case-insensitive search for title

    // Handle the 'my-posts' filter by checking authentication and userId
    if (filter === 'my-posts') {
      // Ensure the user is authenticated
      if (!req.user) {
        throw new ForbiddenException('Authentication is required');
      }

      // Check if the authenticated user's ID matches the userId in the query
      if (userId && userId !== req.user.id) {
        throw new ForbiddenException('You do not have permissions');
      }

      // Filter posts by the current user's ID
      queryBuilder.andWhere('post.UserId = :userId', { userId: req.user.id });
    }

    // Apply pagination and sorting
    queryBuilder
      .take(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .orderBy('post.createdAt', 'DESC');

    // Execute the query and get the results
    const [posts, total] = await queryBuilder.getManyAndCount();

    // Map posts to required format
    const formattedPosts: PostResponse[] = posts.map((post) => ({
      id: post.id,
      author: post.user?.name || 'Unknown', // Access the user's name
      title: post.title,
      content: post.content,
      date: post.updatedAt, // Format date as YYYY-MM-DD
    }));

    // Calculate pagination details
    const totalPages = Math.ceil(total / pageSize);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    return {
      posts: formattedPosts,
      total,
      page: pageNumber,
      pageSize: pageSize,
      nextPage: this.urlGeneratorService.generateNextPageUrl(
        nextPage,
        pageSize,
        req,
      ),
    };
  }

  async findOne(id: number): Promise<Post> {
    // Fetch the post by its primary key
    const post = await this.postRepository.findOne({
      where: { id }, // Use the primary key to find the entity
    });

    // Handle case where the post was not found
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number,
  ): Promise<string> {
    // Fetch the post by its ID
    const post = await this.postRepository.findOne({
      where: { id },
    });

    // Handle case where the post was not found
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if the user owns the post
    if (post.UserId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this post',
      );
    }

    // Update the post properties
    Object.assign(post, updatePostDto);

    // Save the updated post
    await this.postRepository.save(post);

    return 'Post updated successfully';
  }

  async remove(id: number, userId: number, userRole: Role): Promise<string> {
    // Fetch the post by its ID
    const post = await this.postRepository.findOne({
      where: { id },
    });

    // Handle case where the post was not found
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If the user is an admin, allow deletion
    if (userRole === Role.ADMIN) {
      await this.postRepository.remove(post);
      return 'Post deleted successfully';
    }

    // Check if the user owns the post
    if (post.UserId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this post',
      );
    }

    // Delete the post
    await this.postRepository.remove(post);
    return 'Post deleted successfully';
  }
}
