// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   BadRequestException,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import { GqlArgumentsHost } from '@nestjs/graphql'; // Import for GraphQL context
// import { Request, Response } from 'express';

// @Catch(HttpException, BadRequestException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctxType = host.getType<'http' | 'graphql'>(); // Type assertion for possible types

//     if (ctxType === 'http') {
//       // Handle HTTP exceptions
//       const ctx = host.switchToHttp();
//       const response = ctx.getResponse<Response>();
//       const request = ctx.getRequest<Request>();
//       const status = exception.getStatus();
//       const exceptionResponse = exception.getResponse();

//       // If the response is a validation error, format it accordingly
//       if (
//         status === HttpStatus.BAD_REQUEST &&
//         typeof exceptionResponse === 'object' &&
//         'message' in exceptionResponse
//       ) {
//         return response.status(status).json({
//           statusCode: status,
//           timestamp: new Date().toISOString(),
//           path: request.url,
//           message: exceptionResponse['message'],
//         });
//       } else {
//         // Default error response
//         const message =
//           typeof exceptionResponse === 'object' &&
//           'message' in exceptionResponse
//             ? exceptionResponse['message']
//             : exception.message || 'Internal server error';

//         return response.status(status).json({
//           statusCode: status,
//           timestamp: new Date().toISOString(),
//           path: request.url,
//           message,
//         });
//       }
//     } else if (ctxType === 'graphql') {
//       // Handle GraphQL exceptions
//       const gqlHost = GqlArgumentsHost.create(host); // Create a GQL-specific context
//       const context = gqlHost.getContext();
//       const status = exception.getStatus
//         ? exception.getStatus()
//         : HttpStatus.INTERNAL_SERVER_ERROR;
//       const exceptionResponse = exception.getResponse
//         ? exception.getResponse()
//         : exception.message;

//       return {
//         statusCode: status,
//         timestamp: new Date().toISOString(),
//         path: gqlHost.getInfo().fieldName, // Use GraphQL fieldName as the path
//         message:
//           typeof exceptionResponse === 'object' &&
//           'message' in exceptionResponse
//             ? exceptionResponse['message']
//             : exception.message || 'Internal server error',
//       };
//     }
//   }
// }
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql'; // Import for GraphQL context
import { Request, Response } from 'express';

@Catch(HttpException, BadRequestException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctxType = host.getType<'http' | 'graphql'>();

    if (ctxType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const message =
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? exceptionResponse['message']
          : exception.message || 'Internal server error';

      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
    } else if (ctxType === 'graphql') {
      // Let GraphQL handle the exception itself
      throw exception; // Propagate the exception to the GraphQL layer
    }
  }
}
