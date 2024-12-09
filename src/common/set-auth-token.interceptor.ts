import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql'; // Import GqlExecutionContext

@Injectable()
export class SetAuthTokenInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context); // Create GqlExecutionContext
    const response = ctx.getContext().res; // Access the response object from the context
    return next.handle().pipe(
      tap((data) => {
        // Check if the response contains a token
        if (data && data.token) {
          response.cookie('auth_token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Ensure this is set to true in production
            maxAge: 86400000, // 1 day
            sameSite: 'strict',
          });
        }
      }),
    );
  }
}
