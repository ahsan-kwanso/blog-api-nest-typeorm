import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from 'src/utils/jwt.util';
import { Request } from 'express';

@Injectable()
export class JwtConditionalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    // Extract the 'filter' query parameter
    const filter = request.query.filter as string;

    // If the filter is 'my-posts', enforce JWT authentication
    if (filter === 'my-posts') {
      const token = request.headers['authorization']?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      try {
        const decoded = verifyToken(token);
        request.user = decoded; // Attach the decoded token to the request
        return true;
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    }

    // If filter is not 'my-posts', allow the request to proceed without authentication
    return true;
  }
}
