import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const LoggedInUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return user.id; // Return user ID as a number (ensure it's cast correctly)
  },
);
