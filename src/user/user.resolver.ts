import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/pagination.dto';
import { User } from './entities/user.entity'; // Assume you have a User entity defined
import { Roles } from '../common/roles.decorator';
import { Role } from 'src/user/dto/role.enum';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { RolesGuard } from '../common/roles.guard';
import { LoggedInUserId } from 'src/common/LoggedInUserId.decorator';
import { Message } from '../common/message.dto';
import { PaginatedUserWithNumberOfPosts } from './dto/user.dto';
import { UrlExtractionInterceptor } from 'src/common/url.interceptor';
//   import { FileUpload, GraphQLUpload } from 'graphql-upload/Upload.mjs';

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

  //   @Mutation(() => User)
  //   async uploadProfilePicture(
  //     @Args('id', { type: () => Int }) userId: number,
  //     @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
  //     @LoggedInUserId() loggedInUserId: number,
  //   ) {
  //     const user = await this.userService.uploadProfilePicture(
  //       userId,
  //       file,
  //       loggedInUserId,
  //     );
  //     return user;
  //   }
}
