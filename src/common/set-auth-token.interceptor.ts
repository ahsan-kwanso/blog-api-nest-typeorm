import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class SetAuthTokenInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        const request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();

        // Check if the response contains a token
        if (data && data.token) {
          response.cookie('auth_token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Ensure this is set to true in production
            maxAge: 86400000, // 1 day
            sameSite: 'strict',
          });
        } else {
          throw new UnauthorizedException('No token provided');
        }
      }),
    );
  }
}
