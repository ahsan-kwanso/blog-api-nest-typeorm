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
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/pagination.dto';
import { Request as ExpressRequest } from 'express';
import { Roles } from './auth/roles.decorator';
import { Role } from 'src/user/dto/role.enum';
import { RolesGuard } from './auth/roles.guard';
import { LoggedInUserId } from 'src/common/LoggedInUserId.decorator';

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/jpg',
];

const fileFilter = (
  req: ExpressRequest,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return callback(
      new BadRequestException('Invalid file type. Only images are allowed.'),
      false,
    );
  }
  callback(null, true);
};

const limits = {
  fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // Convert MB to bytes
};

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get('/v1')
  @Roles(Role.ADMIN)
  async findAll() {
    return await this.userService.findAll();
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
    return await this.userService.findAllPaginated(
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
  async currentUser(@LoggedInUserId() UserId: number) {
    return await this.userService.getCurrentUser(UserId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return await this.userService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN) // as for my purpose only admin should edit
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @LoggedInUserId() adminId: number,
  ) {
    return await this.userService.update(+id, updateUserDto, adminId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    return await this.userService.remove(+id);
  }

  // file format validation, create custom interceptor inside use interceptor
  @Post(':id/upload-profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter,
      limits,
    }),
  )
  async uploadProfilePicture(
    @Param('id', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
    @LoggedInUserId() loggedInUserId: number, // add custom decorator and then get user
  ) {
    const user = await this.userService.uploadProfilePicture(
      userId,
      file,
      loggedInUserId,
    );
    return { profilePictureUrl: user.profilePictureUrl };
  }
}
