import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException, BadRequestException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // If the response is a validation error, format it accordingly
    if (
      status === 400 &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exceptionResponse['message'],
      });
    } else {
      // Default error response
      const message =
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? exceptionResponse['message']
          : exception.message || 'Internal server error';

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
    }
  }
}
