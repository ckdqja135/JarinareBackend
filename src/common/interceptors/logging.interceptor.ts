import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

/**
 * 모든 HTTP 요청/응답을 로깅하는 인터셉터.
 * 요청 메서드/경로, 응답 상태코드, 처리 시간을 winston 로거로 남긴다.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const { method, originalUrl } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(
            `${method} ${originalUrl} ${res.statusCode} +${ms}ms`,
          );
        },
        error: (err: { status?: number }) => {
          const ms = Date.now() - start;
          const status = err?.status ?? 500;
          this.logger.error(
            `${method} ${originalUrl} ${status} +${ms}ms - ${String(
              (err as Error)?.message ?? err,
            )}`,
          );
        },
      }),
    );
  }
}
