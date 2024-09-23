import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from 'src/thirdParty/sg/email.service';
import { PasswordHelper } from './password.helper';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, EmailService, PasswordHelper],
  controllers: [AuthController],
})
export class AuthModule {}
