import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from 'src/thirdParty/sg/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, EmailService],
  controllers: [AuthController],
})
export class AuthModule {}
