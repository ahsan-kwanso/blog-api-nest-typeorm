import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { Post } from 'src/database/entities/post.entity';
import { User } from 'src/database/entities/user.entity';
import { UrlGeneratorService } from 'src/utils/pagination.util';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatedPostsResponse, PostResponse } from 'src/types/post';
import paginationConfig from 'src/utils/pagination.config';
import { Role } from 'src/types/role.enum';
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
    return this.postRepository.find();
  }

  async getPosts(
    page: number = paginationConfig.defaultPage,
    limit: number = paginationConfig.defaultLimit,
    req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    const pageSize = Number(limit);
    const pageNumber = Number(page);

    // Fetch posts with pagination and related user
    const [posts, total] = await this.postRepository.findAndCount({
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      relations: ['user'], // Eager load the user relation
      order: { createdAt: 'DESC' },
    });

    // Map posts to required format
    const formattedPosts: PostResponse[] = posts.map((post) => ({
      id: post.id,
      author: post.user?.name || 'Unknown', // Access the user's name
      title: post.title,
      content: post.content,
      date: post.updatedAt?.toISOString().split('T')[0], // Format date as YYYY-MM-DD
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

  async getMyPosts(
    userId: number,
    page: number = paginationConfig.defaultPage,
    limit: number = paginationConfig.defaultLimit,
    req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    const pageSize = Number(limit);
    const pageNumber = Number(page);

    // Check if the user has permission to access these posts
    if (userId !== req.user.id) {
      throw new ForbiddenException('You do not have permissions');
    }

    // Fetch posts with pagination and related user
    const [posts, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user') // Eager load the user relation
      .where('post.UserId = :userId', { userId }) // Filter posts by the current user's ID
      .take(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .orderBy('post.createdAt', 'DESC')
      .getManyAndCount();

    // Map posts to required format
    const formattedPosts: PostResponse[] = posts.map((post) => ({
      id: post.id,
      author: post.user?.name || 'Unknown', // Access the user's name
      title: post.title,
      content: post.content,
      date: post.updatedAt?.toISOString().split('T')[0], // Format date as YYYY-MM-DD
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

  async searchPostsByTitle(
    title: string,
    page: number = paginationConfig.defaultPage,
    limit: number = paginationConfig.defaultLimit,
    req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    const pageSize = Number(limit);
    const pageNumber = Number(page);

    // Build the query to fetch posts with pagination, filtering, and sorting
    const queryBuilder: SelectQueryBuilder<Post> = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user') // Eager load the user relation
      .where('post.title ILIKE :title', { title: `%${title}%` }) // Case-insensitive search
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
      date: post.updatedAt?.toISOString().split('T')[0], // Format date as YYYY-MM-DD
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

  async searchUserPostsByTitle(
    userId: number,
    title: string,
    page: number = paginationConfig.defaultPage,
    limit: number = paginationConfig.defaultLimit,
    req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    const pageSize = Number(limit);
    const pageNumber = Number(page);

    if (userId !== req.user.id) {
      throw new ForbiddenException('You do not have permissions');
    }

    // Build the query to fetch posts with pagination, filtering, and sorting
    const queryBuilder: SelectQueryBuilder<Post> = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user') // Eager load the user relation
      .where('post.title ILIKE :title', { title: `%${title}%` }) // Case-insensitive search
      .andWhere('post.UserId = :userId', { userId }) // Filter by userId
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
      date: post.updatedAt?.toISOString().split('T')[0], // Format date as YYYY-MM-DD
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
  ): Promise<Post> {
    // Fetch the post by its ID
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'], // Include user relation if necessary for permission check
    });

    // Handle case where the post was not found
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if the user owns the post
    if (post.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this post',
      );
    }

    // Update the post properties
    Object.assign(post, updatePostDto);

    // Save the updated post
    await this.postRepository.save(post);

    return post;
  }

  async remove(id: number, userId: number, userRole: Role): Promise<void> {
    // Fetch the post by its ID
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'], // Include user relation if necessary for permission check
    });

    // Handle case where the post was not found
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If the user is an admin, allow deletion
    if (userRole === Role.ADMIN) {
      await this.postRepository.remove(post);
      return;
    }

    // Check if the user owns the post
    if (post.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this post',
      );
    }

    // Delete the post
    await this.postRepository.remove(post);
  }
}