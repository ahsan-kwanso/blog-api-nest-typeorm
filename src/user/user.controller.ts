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
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/pagination.dto';
import { Request as ExpressRequest } from 'express';
import { Roles } from '../common/roles.decorator';
import { Role } from 'src/user/dto/role.enum';
import { RolesGuard } from '../common/roles.guard';
import { LoggedInUserId } from 'src/common/LoggedInUserId.decorator';
import { UrlExtractionInterceptor } from 'src/common/url.interceptor';

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
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(UrlExtractionInterceptor)
  async findAllPag(
    @Req() req: ExpressRequest,
    @Query() paginationQuery?: PaginationQueryDto,
  ) {
    const { page, limit, sortBy, sortOrder, role } = paginationQuery || {};
    const { baseUrl, queryParams } = req.urlData || {
      baseUrl: '',
      queryParams: {},
    };
    return await this.userService.findAllPaginated(
      baseUrl,
      queryParams,
      page!,
      limit!,
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
  @UseGuards(RolesGuard)
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
