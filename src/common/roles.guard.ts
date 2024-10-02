import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../common/roles.decorator';
import { Role } from 'src/user/dto/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true; // No roles specified, so allow access
    }

    // Get the GraphQL context instead of HTTP request
    const ctx = GqlExecutionContext.create(context).getContext();
    const user = ctx.req.user; // Access user from GraphQL context's request

    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
