import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/utils/jwt.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector, // Use Reflector to check metadata
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // For GraphQL, we extract the context in a different way
    const ctx = GqlExecutionContext.create(context);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (isPublic) {
      return true; // Allow public routes without authentication
    }

    const req = ctx.getContext().req; // Access the request object from GraphQL context
    const token = req.cookies['auth_token']; // Retrieve the token from the cookie

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verifyToken(token);
      req['user'] = decoded; // Attach user info to the request
      return true; // Allow the request to proceed
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
