import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/pagination.dto';
import { User } from './entities/user.entity'; // Assume you have a User entity defined
import { Roles } from '../common/roles.decorator';
import { Role } from 'src/user/dto/role.enum';
import {
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { RolesGuard } from '../common/roles.guard';
import { LoggedInUserId } from 'src/common/LoggedInUserId.decorator';
import { Message } from '../common/message.dto';
import { PaginatedUserWithNumberOfPosts } from './dto/user.dto';
import { UrlExtractionInterceptor } from 'src/common/url.interceptor';
import { GraphQLUpload, FileUpload } from 'graphql-upload-minimal';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/jpg',
];

interface GraphQLRequestContext {
  urlData?: {
    baseUrl: string;
    queryParams: Record<string, any>;
  };
}

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => PaginatedUserWithNumberOfPosts)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(UrlExtractionInterceptor)
  async findAllPaginated(
    @Args('pagination') paginationQuery: PaginationQueryDto,
    @Context('req') req: GraphQLRequestContext,
  ) {
    // Extract values from paginationQuery
    const { page, limit, sortBy, sortOrder, role } = paginationQuery;

    // Populate queryParams from paginationQuery
    const queryParams = {
      page: page,
      limit: limit,
      sortBy: sortBy,
      sortOrder: sortOrder,
      role: role,
    };

    const baseUrl = req.urlData?.baseUrl || '';

    return await this.userService.findAllPaginated(
      baseUrl,
      queryParams,
      page,
      limit,
      role,
      sortBy,
      sortOrder,
    );
  }

  @Query(() => User)
  async currentUser(@LoggedInUserId() userId: number) {
    return await this.userService.getCurrentUser(userId);
  }

  @Query(() => User)
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return await this.userService.findOne(id);
  }

  @Mutation(() => User)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
    @LoggedInUserId() adminId: number,
  ) {
    return await this.userService.update(id, updateUserDto, adminId);
  }

  @Mutation(() => Message)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Args('id', { type: () => Int }) id: number): Promise<Message> {
    await this.userService.remove(id);
    return { message: 'User Deleted' };
  }

  @Mutation(() => User)
  async uploadProfilePicture(
    @Args('userId', { type: () => Number }) userId: number,
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
    @LoggedInUserId() loggedInUserId: number, // Use this if you need to access the request for loggedInUserId
  ): Promise<User> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only jpg and png images are allowed.',
      );
    }
    // Upload the profile picture
    const user = await this.userService.uploadProfilePicture2(
      userId,
      file,
      loggedInUserId,
    );
    return user;
  }
}
