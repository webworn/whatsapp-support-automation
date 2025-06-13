import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return this.logHttpRequest(context, next);
    }

    return next.handle();
  }

  private logHttpRequest(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Generate request ID
    const requestId = uuidv4();
    request['requestId'] = requestId;
    response.setHeader('X-Request-ID', requestId);

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';

    // Log request
    this.logger.log('Incoming request', {
      requestId,
      method,
      url,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap(data => {
        const duration = Date.now() - startTime;
        const { statusCode } = response;

        this.logger.log('Request completed', {
          requestId,
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
          responseSize: this.getResponseSize(data),
        });
      }),
      catchError(error => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        this.logger.error('Request failed', {
          requestId,
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
          error: error.message,
          stack: error.stack,
        });

        throw error;
      }),
    );
  }

  private getResponseSize(data: any): string {
    if (!data) return '0B';
    
    try {
      const size = JSON.stringify(data).length;
      if (size < 1024) return `${size}B`;
      if (size < 1048576) return `${(size / 1024).toFixed(2)}KB`;
      return `${(size / 1048576).toFixed(2)}MB`;
    } catch {
      return 'unknown';
    }
  }
}