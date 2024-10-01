import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from 'src/utils/jwt.service';
import { Request } from 'express';

@Injectable()
export class ConditionalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const filter = request.query['filter']; // Check for the filter query parameter

    // If 'filter' is 'my-posts', enforce authentication
    if (filter === 'my-posts') {
      const token = request.cookies['auth_token'];

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      try {
        const decoded = this.jwtService.verifyToken(token);
        request.user = decoded; // Attach user info to the request object
        return true; // Token is valid, grant access
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    }

    // If 'filter' is not 'my-posts', allow public access
    return true;
  }
}
