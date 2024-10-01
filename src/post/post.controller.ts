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
import { LoggedInUserId } from 'src/common/LoggedInUserId.decorator';
import { LoggedInUserRole } from 'src/common/LoggedInUserRole.decorator';
import { Role } from 'src/user/dto/role.enum';
import { ConditionalAuthGuard } from 'src/common/conditional.auth.guard';
import { Public } from 'src/common/public.decorator';

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

  @Public() // by pass global guard
  @UseGuards(ConditionalAuthGuard)
  @Get()
  async getPosts(
    @Query() paginationQuery: PaginationQueryDto, // Use the updated DTO for pagination and filters
    @Req() req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    return await this.postService.getPosts(
      paginationQuery, // Pass the entire pagination query DTO
      req,
    );
  }

  @Public()
  @UseGuards(ConditionalAuthGuard)
  @Get('/search')
  async searchPosts(
    @Query() paginationQuery: PaginationQueryDto, // Use the updated DTO for pagination and filters
    @Req() req: ExpressRequest,
  ): Promise<PaginatedPostsResponse> {
    const { title, page, limit, filter, userId } = paginationQuery;
    return await this.postService.searchPosts(
      title ?? '',
      page,
      limit,
      req,
      filter, // Pass the filter from pagination query
      userId, // Pass userId only if it's present
    );
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
