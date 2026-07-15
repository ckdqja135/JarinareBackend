import { WinstonModuleOptions } from 'nest-winston';
import { utilities as nestWinstonUtils } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

/**
 * 로그 파일을 저장할 디렉터리. 기본값은 프로젝트 루트의 `logs`.
 * 환경변수 LOG_DIR 로 변경할 수 있다.
 */
export const LOG_DIR = process.env.LOG_DIR ?? 'logs';

// 파일에 기록할 로그 라인 포맷: [시간] [레벨] [컨텍스트] 메시지 (+ 스택)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const context = info.context ? ` [${String(info.context)}]` : '';
    const stack = info.stack ? `\n${String(info.stack)}` : '';
    return `[${String(info.timestamp)}] [${info.level.toUpperCase()}]${context} ${String(
      info.message,
    )}${stack}`;
  }),
);

export const winstonConfig: WinstonModuleOptions = {
  // 개발 편의를 위해 콘솔에도 함께 출력
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL ?? 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonUtils.format.nestLike('Backend', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),

    // backend-yyyymmdd.log 형태로 날짜별 파일 생성.
    // 압축/보관은 winston-daily-rotate-file 이 직접 관리한다.
    //  - zippedArchive: 회전된(어제까지의) 파일을 gzip 으로 압축(.log.gz)
    //  - maxFiles: 보관 기간. '37d' = 원본 7일 + 압축 30일에 해당하는 총 수명.
    //              (원하면 '30d' 등으로 조정)
    new winston.transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'backend-%DATE%.log',
      datePattern: 'YYYYMMDD',
      zippedArchive: true,
      maxFiles: process.env.LOG_MAX_FILES ?? '37d',
      level: process.env.LOG_LEVEL ?? 'info',
      format: fileFormat,
    }),
  ],
};
