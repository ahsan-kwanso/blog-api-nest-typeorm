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

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req; // Get the request from GraphQL context
    //console.log(request.body.query);
    const filter = gqlContext.getArgs().paginationQuery.filter;
    //const filter = request.query['filter']; // Check for the filter query parameter
    console.log(filter);
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
