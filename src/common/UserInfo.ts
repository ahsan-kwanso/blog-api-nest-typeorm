import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const UserInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const gqlCtx = GqlExecutionContext.create(ctx); // Create GQL context
    const request = gqlCtx.getContext().req; // Access the request object from GraphQL context
    const user = request.user; // Get the user from the request

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    return user; // Return user ID as a number (ensure it's cast correctly)
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
