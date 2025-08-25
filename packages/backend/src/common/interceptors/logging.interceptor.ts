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

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Log da requisição
    this.logger.log(
      `Incoming Request: ${method} ${url} - User-Agent: ${userAgent}`,
      'HTTP Request',
    );

    // Verificar se body existe e tem propriedades
    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      this.logger.debug(
        `Request Body: ${JSON.stringify(body)}`,
        'HTTP Request',
      );
    }

    // Verificar se query existe e tem propriedades
    if (query && typeof query === 'object' && Object.keys(query).length > 0) {
      this.logger.debug(
        `Query Params: ${JSON.stringify(query)}`,
        'HTTP Request',
      );
    }

    // Verificar se params existe e tem propriedades
    if (
      params &&
      typeof params === 'object' &&
      Object.keys(params).length > 0
    ) {
      this.logger.debug(
        `Route Params: ${JSON.stringify(params)}`,
        'HTTP Request',
      );
    }

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = response.statusCode;

        // Log da resposta
        this.logger.log(
          `Response: ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms`,
          'HTTP Response',
        );

        if (data && typeof data === 'object') {
          this.logger.debug(
            `Response Data: ${JSON.stringify(data)}`,
            'HTTP Response',
          );
        }
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = error.status || 500;

        // Log do erro
        this.logger.error(
          `Error: ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms - Message: ${error.message}`,
          error.stack,
          'HTTP Error',
        );

        throw error;
      }),
    );
  }
}
