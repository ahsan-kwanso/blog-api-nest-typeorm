import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from 'src/integrations/sg/email.service';
import { PasswordHelper } from './password.helper';
import { JwtService } from '../../utils/jwt.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, EmailService, PasswordHelper, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
