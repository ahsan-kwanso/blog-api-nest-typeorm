import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from 'src/database/models/post.model';
import { User } from 'src/database/models/user.model';
import { UrlGeneratorService } from 'src/utils/pagination.util';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatedPostsResponse, PostResponse } from 'src/types/post';
import paginationConfig from 'src/utils/pagination.config';
import { Role } from 'src/types/role.enum';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post)
    private readonly postModel: typeof Post,
    private readonly urlGeneratorService: UrlGeneratorService,
  ) {}

  async create(createPostDto: CreatePostDto, UserId: number): Promise<Post> {
    try {
      const post = await this.postModel.create({
        ...createPostDto,
        UserId, // Attach the userId from the request (decoded JWT)
      } as Post);
      return post.reload();
    } catch (error) {
      throw new ConflictException('Failed to create post');
    }
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.findAll();
  }

  async getPosts(
    page: number = paginationConfig.defaultPage,
    limit: number = paginationConfig.defaultLimit,
    req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    const pageSize = Number(limit);
    const pageNumber = Number(page);
    // Fetch posts with pagination
    const { count, rows } = await this.postModel.findAndCountAll({
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      include: [
        {
          model: User,
          attributes: ['name'], // Fetch only the name attribute from the User model
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Map posts to required format
    const posts: PostResponse[] = rows.map((post) => ({
      id: post.id,
      author: post.user.name, // Access the user's name
      title: post.title,
      content: post.content,
      date: post.updatedAt?.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));

    // Calculate pagination details
    const totalPages = Math.ceil(count / pageSize);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    return {
      posts,
      total: count,
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

    if (userId !== req.user.id) {
      throw new ForbiddenException('You do not have permissions');
    }
    // Fetch posts with pagination
    const { count, rows } = await this.postModel.findAndCountAll({
      where: {
        UserId: userId, // Filter posts by the current user's ID
      },
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      include: [
        {
          model: User,
          attributes: ['name'], // Fetch only the name attribute from the User model
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Map posts to required format
    const posts: PostResponse[] = rows.map((post) => ({
      id: post.id,
      author: post.user.name, // Access the user's name
      title: post.title,
      content: post.content,
      date: post.updatedAt?.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));

    // Calculate pagination details
    const totalPages = Math.ceil(count / pageSize);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    return {
      posts,
      total: count,
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

    const { count, rows } = await this.postModel.findAndCountAll({
      where: {
        title: {
          [Op.iLike]: `%${title}%`, // Case-insensitive
        },
      },
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const posts: PostResponse[] = rows.map((post) => ({
      id: post.id,
      author: post.user.name,
      title: post.title,
      content: post.content,
      date: post.updatedAt.toISOString().split('T')[0],
    }));

    const totalPages = Math.ceil(count / pageSize);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    return {
      posts,
      total: count,
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

    const { count, rows } = await this.postModel.findAndCountAll({
      where: {
        title: {
          [Op.iLike]: `%${title}%`, // Case-insensitive
        },
        UserId: userId,
      },
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const posts: PostResponse[] = rows.map((post) => ({
      id: post.id,
      author: post.user.name,
      title: post.title,
      content: post.content,
      date: post.updatedAt.toISOString().split('T')[0],
    }));

    const totalPages = Math.ceil(count / pageSize);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    return {
      posts,
      total: count,
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
    const post = await this.postModel.findByPk(id);
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
    const post = await this.findOne(id);

    // Check if the user owns the post
    if (post.UserId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this post',
      );
    }

    await post.update(updatePostDto);
    return post;
  }

  async remove(id: number, userId: number, userRole: Role): Promise<void> {
    const post = await this.findOne(id);
    if (userRole === Role.ADMIN) {
      return await post.destroy();
    }
    // Check if the user owns the post
    if (post.UserId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this post',
      );
    }

    return await post.destroy();
  }
}
