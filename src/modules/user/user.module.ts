import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from 'src/database/entities/user.entity';
import { UrlGeneratorService } from 'src/utils/pagination.util';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UrlGeneratorService],
})
export class UserModule {}
