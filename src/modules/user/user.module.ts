import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from 'src/database/models/user.model';
import { UrlGeneratorService } from 'src/utils/pagination.util';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UrlGeneratorService],
})
export class UserModule {}
