import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './post.entity';
import { PaginatedPostsResponse } from './dto/post.dto';
import { PaginationQueryDto } from '../common/pagination.dto';
import { Public } from 'src/common/public.decorator';
import { UrlExtractionInterceptor } from 'src/common/url.interceptor';
import { LoggedInUserId } from 'src/common/LoggedInUserId.decorator';
import { LoggedInUserRole } from 'src/common/LoggedInUserRole.decorator';
import { Role } from 'src/user/dto/role.enum';
import { ConditionalAuthGuard } from 'src/common/conditional.auth.guard';
import { NotFoundException, UseGuards, UseInterceptors } from '@nestjs/common';
import { Message } from 'src/common/message.dto';

interface GraphQLRequestContext {
  urlData?: {
    baseUrl: string;
    queryParams: Record<string, any>;
    currUserId: number;
  };
}

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  // Create a new post
  @Mutation(() => Message)
  async createPost(
    @Args('createPostDto') createPostDto: CreatePostDto,
    @LoggedInUserId() userId: number,
  ): Promise<Message> {
    await this.postService.create(createPostDto, userId);
    return { message: 'Post created successfully' };
  }

  @Public()
  @UseGuards(ConditionalAuthGuard)
  @UseInterceptors(UrlExtractionInterceptor)
  @Query(() => PaginatedPostsResponse)
  async getPosts(
    @Args('paginationQuery') paginationQuery: PaginationQueryDto,
    @Context('req') req: GraphQLRequestContext,
  ): Promise<PaginatedPostsResponse> {
    const { page, limit, filter, userId } = paginationQuery;
    const { baseUrl, queryParams, currUserId } = req.urlData || {
      baseUrl: '',
      queryParams: {},
    };
    return await this.postService.getPosts(
      page,
      limit,
      filter,
      userId,
      queryParams,
      baseUrl,
      currUserId,
    );
  }

  // Search posts by title
  @Public()
  @UseGuards(ConditionalAuthGuard)
  @UseInterceptors(UrlExtractionInterceptor)
  @Query(() => PaginatedPostsResponse)
  async searchPosts(
    @Args('paginationQuery') paginationQuery: PaginationQueryDto,
    @Context('req') req: GraphQLRequestContext,
  ): Promise<PaginatedPostsResponse> {
    const { title, page, limit, filter, userId } = paginationQuery;
    const { baseUrl, queryParams, currUserId } = req.urlData || {
      baseUrl: '',
      queryParams: {},
    };
    return await this.postService.searchPosts(
      title ?? '',
      page,
      limit,
      filter,
      userId,
      queryParams,
      baseUrl,
      currUserId,
    );
  }

  // Get a single post by ID
  @Query(() => Post, { nullable: true })
  async getPost(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Post | null> {
    return await this.postService.findOne(id);
  }

  // Update a post by ID
  @Mutation(() => Message)
  async updatePost(
    @Args('id', { type: () => Int }) id: number,
    @Args('updatePostDto') updatePostDto: UpdatePostDto,
    @LoggedInUserId() userId: number,
  ): Promise<Message> {
    const message = await this.postService.update(id, updatePostDto, userId);
    return { message: message };
  }

  // Delete a post by ID
  @Mutation(() => Message)
  async deletePost(
    @Args('id', { type: () => Int }) id: number,
    @LoggedInUserId() userId: number,
    @LoggedInUserRole() userRole: Role,
  ): Promise<Message> {
    const message = await this.postService.remove(id, userId, userRole);
    return { message: message };
  }
}
