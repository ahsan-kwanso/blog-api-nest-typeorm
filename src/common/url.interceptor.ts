import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UrlExtractionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Extract necessary data
    const protocol = request.protocol;
    const host = request.get('host');
    const baseUrl = `${protocol}://${host}${request.originalUrl.split('?')[0]}`;
    const queryParams = request.query;

    // Attach the extracted data to the request object
    request.urlData = {
      baseUrl,
      queryParams,
    };

    return next.handle();
  }
}
