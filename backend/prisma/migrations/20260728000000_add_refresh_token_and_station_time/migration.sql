-- users: refresh token 컬럼 추가 (JWT 리프레시 토큰 로그인/갱신에 사용)
-- AlterTable
ALTER TABLE `users` ADD COLUMN `refreshToken` VARCHAR(512) NULL,
    ADD COLUMN `refreshTokenExpiresAt` DATETIME(3) NULL;

-- 열차 시간 조회 캐시 테이블 (StationTime 모델)
-- CreateTable
CREATE TABLE `stations_times` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `depPlaceId` VARCHAR(40) NOT NULL,
    `arrPlaceId` VARCHAR(40) NOT NULL,
    `depPlandTime` VARCHAR(14) NOT NULL,
    `pageNo` INTEGER NOT NULL DEFAULT 1,
    `numOfRows` INTEGER NOT NULL DEFAULT 200,
    `data` JSON NOT NULL,
    `cachedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `stations_times_depPlaceId_arrPlaceId_depPlandTime_pageNo_num_key`(`depPlaceId`, `arrPlaceId`, `depPlandTime`, `pageNo`, `numOfRows`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `users_refreshToken_key` ON `users`(`refreshToken`);
