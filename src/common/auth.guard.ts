import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from 'src/utils/jwt.service';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector, // Use Reflector to check metadata
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Allow public routes without authentication
    }

    const request: Request = context.switchToHttp().getRequest();
    const token = request.cookies['auth_token']; // Retrieve the token from the cookie

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verifyToken(token);
      request['user'] = decoded; // Attach user info to the request
      return true; // Allow the request to proceed
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
