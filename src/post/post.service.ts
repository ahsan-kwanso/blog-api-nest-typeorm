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
import { Repository } from 'typeorm';
import { FindManyOptions, ILike } from 'typeorm';
import { FollowerService } from 'src/user/follower.service';
import { UserService } from 'src/user/user.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly urlGeneratorService: UrlGeneratorService,
    private readonly followerService: FollowerService,
    private readonly userService: UserService,
    @InjectQueue('email') private emailQueue: Queue, // Inject email queue
  ) {}

  async create(createPostDto: CreatePostDto, UserId: number): Promise<Post> {
    try {
      // Create a new instance of the Post entity
      const post = this.postRepository.create({
        ...createPostDto,
        UserId, // Attach the userId from the request (decoded JWT)
      });

      // Save the new post to the database
      const savedPost = await this.postRepository.save(post);

      // Fetch followers of the user who created the post
      const followerIds =
        await this.followerService.getFollowersByUserId(UserId);
      for (let i = 0; i < followerIds.length; i++) {
        // For demonstration, assume we have a method to get the follower's email
        const followerEmail = await this.userService.getFollowerEmailById(
          followerIds[i],
        ); // Implement this method as needed
        // Add a job to the email queue
        console.log('                                          ');
        console.log('***************     *********************');
        console.log(`Adding email task ${i + 1} to the queue...`);
        console.log('***************     *********************');
        console.log('                                          ');

        await this.emailQueue.add('sendEmail', {
          followerEmail,
          blogPost: savedPost,
          timestamp: new Date(),
        });
      }

      return savedPost;
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
    const postUserId = filter === 'my-posts' ? currUserId : undefined;

    // Create query options
    const whereCondition = postUserId ? { user: { id: postUserId } } : {};

    // Fetch posts using repository's findAndCount method
    const [posts, total] = await this.postRepository.findAndCount({
      where: whereCondition,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

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
    // Define the query options
    const options: FindManyOptions<Post> = {
      where: {
        title: ILike(`%${title}%`),
      },
      relations: ['user'], // Include the user relation
      take: limit,
      skip: (page - 1) * limit,
      order: {
        createdAt: 'DESC',
      },
    };

    // Handle 'my-posts' filter
    if (filter === 'my-posts') {
      // You should have userId available from your context or however you implement it
      if (!userId) {
        throw new ForbiddenException('Authentication is required');
      }
      if (userId !== currUserId) {
        throw new ForbiddenException('You do not have permissions');
      }
      options.where = {
        ...options.where,
        UserId: userId, // Filter by userId
      };
    }

    const [posts, total] = await this.postRepository.findAndCount(options);

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      author: post.user?.name || 'Unknown',
      title: post.title,
      content: post.content,
      date: post.updatedAt,
    }));

    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      posts: formattedPosts,
      total,
      page: page,
      pageSize: limit,
      nextPage: this.urlGeneratorService.generateNextPageUrl2(
        nextPage,
        limit,
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
