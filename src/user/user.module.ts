import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from 'src/user/user.entity';
import { UrlGeneratorService } from 'src/utils/pagination.util';
import { FileUploadService } from 'src/integrations/s3/file-upload.service';
import { Role } from './role.entity';
import { RoleService } from './role.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UserController],
  providers: [UserService, UrlGeneratorService, FileUploadService, RoleService],
})
export class UserModule {}
