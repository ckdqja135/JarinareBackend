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
