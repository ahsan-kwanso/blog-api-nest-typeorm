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
import { PaginatedPostsResponse } from './dto/post';
import { JwtConditionalAuthGuard } from '../user/auth/jwt.auth.guard';
import { LoggedInUserId } from 'src/common/LoggedInUserId.decorator';
import { LoggedInUserRole } from 'src/common/LoggedInUserRole.decorator';
import { Role } from 'src/user/dto/role.enum';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Create a new post
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @LoggedInUserId() userId: number,
  ): Promise<PostModel> {
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
    @LoggedInUserId() userId: number,
  ): Promise<{ message: string }> {
    return {
      message: await this.postService.update(id, updatePostDto, userId),
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUserId() userId: number,
    @LoggedInUserRole() userRole: Role,
  ): Promise<{ message: string }> {
    return { message: await this.postService.remove(id, userId, userRole) };
  }
}
