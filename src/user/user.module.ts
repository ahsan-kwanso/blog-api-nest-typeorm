import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from 'src/user/entities/user.entity';
import { UrlGeneratorService } from 'src/utils/pagination.util';
import { PasswordHelper } from './password.helper';
import { Role } from './entities/role.entity';
import { RoleService } from './role.service';
import { AuthController } from './auth.controller';
import { FileUploadModule } from 'src/integrations/s3/file-upload.module';
import { JwtModule } from 'src/utils/jwt.module';
import { EmailModule } from 'src/integrations/sg/email.module';
import { AuthResolver } from './auth.resolver';
import { UserResolver } from './user.resolver';
import { UserSubscriber } from './user.subscriber';
import { FollowerService } from './follower.service';
import { Follower } from './entities/follower.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Follower]),
    FileUploadModule,
    JwtModule,
    EmailModule,
  ],
  controllers: [UserController, AuthController],
  providers: [
    UserService,
    UrlGeneratorService,
    RoleService,
    PasswordHelper,
    AuthResolver,
    UserResolver,
    UserSubscriber,
    FollowerService,
  ],
  exports: [UserService, FollowerService],
})
export class UserModule {}
