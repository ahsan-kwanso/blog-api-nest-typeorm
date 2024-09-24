import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from 'src/utils/jwt.util';

@Injectable()
export class ConditionalPostAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { filter } = req.query;

    // Check if the filter is 'my-posts', which requires authentication
    if (filter === 'my-posts') {
      const token = req.headers['authorization']?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Authentication is required');
      }

      try {
        const decoded = verifyToken(token); // Verifies the JWT token and decodes it
        req.user = decoded; // Attach user to the request if token is valid
      } catch (error) {
        throw new ForbiddenException('Invalid or expired token');
      }
    }

    next(); // Continue to the next middleware or controller
  }
}
