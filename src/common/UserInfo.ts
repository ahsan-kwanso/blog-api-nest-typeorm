import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const UserInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return user;
  },
);

// just for reference haven't used it anywhere, just as a suggestion to use this
/*
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum RoleEnum {
  ADMIN = 'admin',
  USER = 'user',
  // Add other roles as needed
}

export class UserDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(RoleEnum)
  role: RoleEnum;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}


add this dto as a type for this
 */
