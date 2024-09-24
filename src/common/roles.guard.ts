import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
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

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
