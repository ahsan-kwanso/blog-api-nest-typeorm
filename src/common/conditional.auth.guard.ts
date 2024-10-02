import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/utils/jwt.service';

@Injectable()
export class ConditionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const filter = ctx.req.query['filter']; // Extract 'filter' from GraphQL context's request query

    // If 'filter' is 'my-posts', enforce authentication
    if (filter === 'my-posts') {
      const token = ctx.req.cookies['auth_token']; // Get token from cookies

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      try {
        const decoded = this.jwtService.verifyToken(token);
        ctx.req.user = decoded; // Attach user info to the request object
        return true; // Token is valid, grant access
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    }

    // If 'filter' is not 'my-posts', allow public access
    return true;
  }
}
