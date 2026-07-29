import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException } from '../errors/app.exception';
import { defaultCodeForStatus, ErrorCode } from '../errors/error-code';

interface ErrorResponseBody {
  statusCode: number;
  code: string;
  message: string;
}

/**
 * 모든 예외를 { statusCode, code, message } 표준 형태로 변환하는 전역 필터.
 *
 * 보안 원칙:
 *  - 외부 API 원본 오류/스택 트레이스/시크릿을 클라이언트에 노출하지 않는다.
 *  - 5xx(내부 오류)의 상세 메시지는 서버 로그에만 남기고 클라이언트에는 일반 메시지를 반환한다.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const body = this.toBody(exception);

    if (body.statusCode >= 500) {
      // 내부 오류는 원인을 서버 로그에만 남긴다.
      this.logger.error(
        `${body.code} ${body.statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    res.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorResponseBody {
    if (exception instanceof AppException) {
      return {
        statusCode: exception.getStatus(),
        code: exception.code,
        message: this.messageOf(exception),
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      // class-validator(ValidationPipe) 는 message 를 문자열 배열로 담는다.
      const message = this.messageOf(exception);
      const code =
        typeof response === 'object' &&
        response !== null &&
        'code' in response &&
        typeof (response as { code?: unknown }).code === 'string'
          ? ((response as { code: string }).code as ErrorCode)
          : defaultCodeForStatus(status);
      return { statusCode: status, code, message };
    }

    // 알 수 없는 예외: 상세를 감추고 일반 메시지만 반환한다.
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_ERROR,
      message: '서버 내부 오류가 발생했습니다.',
    };
  }

  private messageOf(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') return response;
    if (typeof response === 'object' && response !== null) {
      const msg = (response as { message?: unknown }).message;
      if (Array.isArray(msg)) return msg.join(', ');
      if (typeof msg === 'string') return msg;
    }
    return exception.message;
  }
}
