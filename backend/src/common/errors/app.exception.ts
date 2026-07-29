import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-code';

/**
 * code 를 함께 담는 애플리케이션 예외.
 * 전역 예외 필터가 { statusCode, code, message } 형태로 직렬화한다.
 *
 * 예) throw new AppException(ErrorCode.STATION_NOT_FOUND, '역을 찾을 수 없습니다.', HttpStatus.NOT_FOUND)
 */
export class AppException extends HttpException {
  readonly code: ErrorCode;

  constructor(
    code: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message }, status);
    this.code = code;
  }
}
