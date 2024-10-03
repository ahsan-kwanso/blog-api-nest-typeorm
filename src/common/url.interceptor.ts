import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

@Injectable()
export class UrlExtractionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Use GqlExecutionContext to extract the request from GraphQL context
    const ctx = GqlExecutionContext.create(context).getContext();
    const request = ctx.req;

    // Extract necessary data
    const protocol = request.protocol;
    const host = request.get('host');
    const baseUrl = `${protocol}://${host}${request.originalUrl.split('?')[0]}`;
    const queryParams = request.query;
    const currUserId = request.user ? request.user.id : null; // Handle case when user is not authenticated

    // Attach the extracted data to the request object
    request.urlData = {
      baseUrl,
      queryParams,
      currUserId, // Include user ID
    };

    return next.handle();
  }
}
