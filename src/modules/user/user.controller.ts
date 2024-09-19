import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../post/dto/pagination.dto';
import { Request as ExpressRequest } from 'express';
import { Roles } from '../auth/roles.decorator';
import { Role } from 'src/types/role.enum';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('/v1')
  @Roles(Role.ADMIN)
  async findAll() {
    return this.userService.findAll();
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAllPag(
    @Req() req: ExpressRequest,
    @Query() paginationQuery?: PaginationQueryDto,
    @Query('role') role?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const page = paginationQuery?.page;
    const limit = paginationQuery?.limit;
    return this.userService.findAllPaginated(
      req,
      page,
      limit,
      role,
      sortBy,
      sortOrder,
    );
  }

  // get the logged in user
  @Get('/me')
  async currentUser(@Req() req: ExpressRequest) {
    const UserId = req.user?.id;
    return this.userService.getCurrentUser(UserId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN) // as for my purpose only admin should edit
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: ExpressRequest,
  ) {
    const adminId = req.user.id;
    return this.userService.update(+id, updateUserDto, adminId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    return this.userService.remove(+id);
  }

  @Post(':id/upload-profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Param('id', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: ExpressRequest,
  ) {
    const loggedInUserId = req.user.id;
    const user = await this.userService.uploadProfilePicture(
      Number(userId),
      file,
      Number(loggedInUserId),
    );
    return { profilePictureUrl: user.profilePictureUrl };
  }
}
