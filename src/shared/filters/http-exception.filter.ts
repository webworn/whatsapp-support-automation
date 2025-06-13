import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getStatus(exception);
    const message = this.getMessage(exception);
    const requestId = request['requestId'] || 'unknown';

    const errorResponse = {
      statusCode: status,
      message,
      error: this.getErrorType(status),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId,
    };

    // Log the error
    if (status >= 500) {
      this.logger.error('Internal server error', {
        ...errorResponse,
        stack: exception instanceof Error ? exception.stack : undefined,
        userId: request['user']?.id,
        ip: request.ip,
      });
    } else if (status >= 400) {
      this.logger.warn('Client error', {
        ...errorResponse,
        userId: request['user']?.id,
        ip: request.ip,
      });
    }

    // Send error response
    response.status(status).json(errorResponse);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    // Database errors
    if (this.isDatabaseError(exception)) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }

    // Validation errors
    if (this.isValidationError(exception)) {
      return HttpStatus.BAD_REQUEST;
    }

    // Default to 500
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): string | object {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'object' ? response : { message: response };
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private getErrorType(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service Unavailable';
      default:
        return 'Error';
    }
  }

  private isDatabaseError(exception: unknown): boolean {
    if (!(exception instanceof Error)) return false;
    
    const dbErrorCodes = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ECONNRESET',
      'ETIMEDOUT',
    ];

    return dbErrorCodes.some(code => exception.message.includes(code));
  }

  private isValidationError(exception: unknown): boolean {
    if (!(exception instanceof Error)) return false;
    
    return exception.name === 'ValidationError' || 
           exception.message.includes('validation') ||
           exception.message.includes('invalid');
  }
}