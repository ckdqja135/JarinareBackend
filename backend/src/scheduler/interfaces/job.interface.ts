/**
 * 스케줄러 작업 상태. scheduler_run_log.status 에 문자열로 저장된다.
 * (Prisma enum 대신 문자열로 두어 마이그레이션 부담을 줄인다.)
 */
export enum JobStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

/**
 * enqueue 파라미터. 실제 작업은 jobFn 클로저로 주입하여 큐를 도메인 독립적으로 유지한다.
 */
export interface EnqueueParams {
  /** 작업 이름 (예: "station-sync", "train-time-sync"). 중복 검사 키의 일부. */
  jobName: string;
  /** 대상 시작일(YYYYMMDD). 날짜 개념이 없는 작업은 실행일을 넣는다. */
  startYmd: string;
  /** 대상 종료일(YYYYMMDD). */
  endYmd: string;
  /** true 면 중복 실행 검사(PENDING/RUNNING)를 건너뛴다. */
  force?: boolean;
  /** true 면 중복 시 예외 대신 null 을 반환한다. (크론이 사용) */
  skipIfRunning?: boolean;
  /** 워커가 실행할 실제 작업. 반환값(있으면)은 metadata 로 저장된다. */
  jobFn: (runId: bigint) => Promise<unknown>;
}

/** 인메모리 큐 항목. */
export interface JobEntry {
  runId: bigint;
  jobFn: (runId: bigint) => Promise<unknown>;
}
