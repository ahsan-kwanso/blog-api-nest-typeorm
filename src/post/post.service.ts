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
    page: number = paginationConfig.defaultPage,
    limit: number = paginationConfig.defaultLimit,
    req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    // Call common logic with no specific user filtering
    return await this.fetchPosts(null, page, limit, req);
  }

  async getMyPosts(
    userId: number,
    page: number = paginationConfig.defaultPage,
    limit: number = paginationConfig.defaultLimit,
    req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    // Ensure the authenticated user can access their posts
    if (userId !== req.user.id) {
      throw new ForbiddenException('You do not have permissions');
    }

    // Call common logic with user filtering
    return await this.fetchPosts(userId, page, limit, req);
  }

  /**
   * Fetches posts with optional user filtering.
   * This method contains the common pagination, sorting, and formatting logic.
   */
  private async fetchPosts(
    userId: number | null,
    page: number,
    limit: number,
    req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    const pageSize = Number(limit);
    const pageNumber = Number(page);

    // Define a base query, use query builder less
    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user') // Eager load the user relation
      .orderBy('post.createdAt', 'DESC')
      .take(pageSize)
      .skip((pageNumber - 1) * pageSize);

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
    userId?: number, // Optional userId for filtering user-specific posts
  ): Promise<PaginatedPostsResponse> {
    const pageSize = Number(limit);
    const pageNumber = Number(page);

    // Check if filtering by user is needed
    if (userId && userId !== req.user.id) {
      throw new ForbiddenException('You do not have permissions');
    }

    // Build the query to fetch posts with pagination, filtering, and sorting
    const queryBuilder: SelectQueryBuilder<Post> = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user') // Eager load the user relation
      .where('post.title ILIKE :title', { title: `%${title}%` }); // Case-insensitive search for title

    // If userId is provided, filter posts by the current user's ID
    if (userId) {
      queryBuilder.andWhere('post.UserId = :userId', { userId });
    }

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
