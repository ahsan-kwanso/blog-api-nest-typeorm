import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from 'src/database/entities/user.entity';
import { UrlGeneratorService } from 'src/utils/pagination.util';
import { FileUploadService } from 'src/thirdParty/s3/file-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UrlGeneratorService, FileUploadService],
})
export class UserModule {}
