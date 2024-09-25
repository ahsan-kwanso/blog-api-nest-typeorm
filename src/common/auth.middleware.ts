import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from 'src/utils/jwt.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {} // Inject JwtService
  use(req: Request, res: Response, next: NextFunction) {
    //const token = req.headers['authorization']?.split(' ')[1]; -> if not used cookie then this
    const token = req.cookies['auth_token']; // Retrieve the token from the cookie
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verifyToken(token);
      req.user = decoded; // Attach user info to request
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
