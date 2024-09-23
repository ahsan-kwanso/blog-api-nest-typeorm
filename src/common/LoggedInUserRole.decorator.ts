import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from 'src/user/dto/role.enum';

export const LoggedInUserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Role => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.role) {
      throw new UnauthorizedException('User not authenticated');
    }
    return user.role;
  },
);
