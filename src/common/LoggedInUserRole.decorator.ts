import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const LoggedInUserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const gqlCtx = GqlExecutionContext.create(ctx); // Create GQL context
    const request = gqlCtx.getContext().req; // Access the request object from GraphQL context
    const user = request.user; // Get the user from the request

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    return user.role; // Return user ID as a number (ensure it's cast correctly)
  },
);
