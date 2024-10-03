import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Post } from 'src/post/post.entity';
import { UrlGeneratorService } from 'src/utils/pagination.util';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatedPostsResponse, PostResponse } from './dto/post.dto';
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
    filter?: string,
    userId?: number,
    queryParams?: any,
    baseUrl?: string,
    currUserId?: number,
  ): Promise<PaginatedPostsResponse> {
    // Check for 'my-posts' filter and permissions
    if (filter === 'my-posts') {
      if (!currUserId || userId !== currUserId) {
        throw new ForbiddenException(
          'Authentication is required or you do not have permissions',
        );
      }
    }

    // Define userId based on the filter
    const postUserId = filter === 'my-posts' ? currUserId : null;

    // Fetch posts based on userId
    const [posts, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where(postUserId ? 'post.UserId = :userId' : '1=1', {
        userId: postUserId,
      })
      .orderBy('post.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit)
      .getManyAndCount();

    // Format posts
    const formattedPosts: PostResponse[] = posts.map((post) => ({
      id: post.id,
      author: post.user?.name,
      title: post.title,
      content: post.content,
      date: post.updatedAt,
    }));

    // Pagination details
    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      posts: formattedPosts,
      total,
      page,
      pageSize: limit,
      nextPage: this.urlGeneratorService.generateNextPageUrl2(
        nextPage,
        limit,
        baseUrl!,
        queryParams,
      ),
    };
  }

  async searchPosts(
    title: string,
    page: number = paginationConfig.defaultPage,
    limit: number = paginationConfig.defaultLimit,
    filter?: string, // Filter for 'my-posts' etc.
    userId?: number,
    queryParams?: any, // Pass query parameters if needed
    baseUrl?: string, // Pass base URL for URL generation
    currUserId?: number,
  ): Promise<PaginatedPostsResponse> {
    const pageSize = Number(limit);
    const pageNumber = Number(page);

    const queryBuilder: SelectQueryBuilder<Post> = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.title ILIKE :title', { title: `%${title}%` });

    // Handle 'my-posts' filter
    if (filter === 'my-posts') {
      // You should have userId available from your context or however you implement it
      if (!userId) {
        throw new ForbiddenException('Authentication is required');
      }
      if (userId !== currUserId) {
        throw new ForbiddenException('You do not have permissions');
      }
      queryBuilder.andWhere('post.UserId = :userId', { userId });
    }

    // Apply pagination and sorting
    queryBuilder
      .take(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .orderBy('post.createdAt', 'DESC');

    const [posts, total] = await queryBuilder.getManyAndCount();

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      author: post.user?.name || 'Unknown',
      title: post.title,
      content: post.content,
      date: post.updatedAt,
    }));

    const totalPages = Math.ceil(total / pageSize);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    return {
      posts: formattedPosts,
      total,
      page: pageNumber,
      pageSize: pageSize,
      nextPage: this.urlGeneratorService.generateNextPageUrl2(
        nextPage,
        pageSize,
        baseUrl!,
        queryParams,
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
