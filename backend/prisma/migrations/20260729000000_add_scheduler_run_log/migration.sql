-- 스케줄러 작업 큐 / 실행 로그 테이블 (SchedulerRunLog 모델)
-- 크론·수동 트리거가 PENDING 으로 적재하고 인메모리 단일 워커가 RUNNING → SUCCESS/FAILED 로 갱신한다.
-- CreateTable
CREATE TABLE `scheduler_run_log` (
    `runId` BIGINT NOT NULL AUTO_INCREMENT,
    `jobName` VARCHAR(100) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `startYmd` VARCHAR(10) NOT NULL,
    `endYmd` VARCHAR(10) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,
    `errorMessage` TEXT NULL,
    `metadata` JSON NULL,

    INDEX `scheduler_run_log_jobName_startYmd_endYmd_idx`(`jobName`, `startYmd`, `endYmd`),
    INDEX `scheduler_run_log_status_idx`(`status`),
    PRIMARY KEY (`runId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
