import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { PaginationQueryDto } from '../common/pagination.dto';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostModel } from 'src/post/post.entity';
import { PaginatedPostsResponse } from 'src/types/post';
import { JwtConditionalAuthGuard } from '../user/auth/jwt.auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Create a new post
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: ExpressRequest,
  ): Promise<PostModel> {
    const userId = req.user.id; // Extract userId from the JWT
    return await this.postService.create(createPostDto, userId);
  }

  @UseGuards(JwtConditionalAuthGuard) // as I have removed middlware authentication so this will check if filter is passed because in that case authentication is required
  @Get()
  async getPosts(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('filter') filter: string, // Additional query parameter
    @Query('userId') userId: string,
    @Req() req: ExpressRequest, // Add the request object
  ): Promise<PaginatedPostsResponse> {
    if (filter === 'my-posts' && userId) {
      return await this.postService.getMyPosts(
        parseInt(userId),
        paginationQuery.page,
        paginationQuery.limit,
        req,
      );
    } else {
      return await this.postService.getPosts(
        paginationQuery.page,
        paginationQuery.limit,
        req,
      );
    }
  }

  @UseGuards(JwtConditionalAuthGuard)
  @Get('/search')
  async searchPosts(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('title') title: string,
    @Query('filter') filter: string,
    @Query('userId') userId: string,
    @Req() req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    if (filter === 'my-posts' && userId) {
      return await this.postService.searchPosts(
        title,
        paginationQuery.page,
        paginationQuery.limit,
        req,
        parseInt(userId),
      );
    } else {
      return await this.postService.searchPosts(
        title,
        paginationQuery.page,
        paginationQuery.limit,
        req,
      );
    }
  }

  // Get a single post by ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return await this.postService.findOne(id);
  }

  // Update a post by ID (only if the user owns the post)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: ExpressRequest,
  ): Promise<{ message: string }> {
    const userId = req.user.id; // Extract userId from the JWT
    return {
      message: await this.postService.update(id, updatePostDto, userId),
    };
  }

  // Delete a post by ID (only if the user owns the post)
  // @UseGuards(RolesGuard) // Apply guards
  // @Roles(Role.USER, Role.ADMIN) // Only admin users can delete posts
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ExpressRequest,
  ): Promise<{ message: string }> {
    const userId = req.user.id; // Extract userId from the JWT;
    const role = req.user.role;
    return { message: await this.postService.remove(id, userId, role) };
  }
}
