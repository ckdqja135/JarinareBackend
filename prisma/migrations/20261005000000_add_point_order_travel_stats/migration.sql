-- 포인트 적립 내역 · 결제/반환 내역 · 목적지별 예매 통계 (기존 Firestore 에서 이전)

-- CreateTable
CREATE TABLE `point_histories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userIdx` BIGINT NOT NULL,
    `amount` INTEGER NOT NULL,
    `reason` VARCHAR(30) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `point_histories_userIdx_createdAt_idx`(`userIdx`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_histories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userIdx` BIGINT NOT NULL,
    `tripId` BIGINT NULL,
    `reservationOrderId` VARCHAR(36) NULL,
    `startStationForView` VARCHAR(100) NOT NULL,
    `endStationForView` VARCHAR(100) NOT NULL,
    `startDay` VARCHAR(14) NOT NULL,
    `startDayForView` VARCHAR(50) NOT NULL,
    `trainType` VARCHAR(20) NOT NULL,
    `selectAdult` INTEGER NOT NULL,
    `selectKid` INTEGER NOT NULL,
    `seatCount` INTEGER NOT NULL,
    `finalPrice` INTEGER NOT NULL,
    `usedPoint` INTEGER NOT NULL DEFAULT 0,
    `paybackPoint` INTEGER NOT NULL DEFAULT 0,
    `paymentMethod` VARCHAR(20) NOT NULL,
    `selectedCard` VARCHAR(30) NULL,
    `isReturn` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_histories_userIdx_createdAt_idx`(`userIdx`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `travel_stats` (
    `destination` VARCHAR(100) NOT NULL,
    `totalCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `travel_stats_totalCount_idx`(`totalCount`),
    PRIMARY KEY (`destination`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `travel_stat_buckets` (
    `destination` VARCHAR(100) NOT NULL,
    `kind` VARCHAR(10) NOT NULL,
    `bucket` VARCHAR(20) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`destination`, `kind`, `bucket`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `point_histories` ADD CONSTRAINT `point_histories_userIdx_fkey` FOREIGN KEY (`userIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_histories` ADD CONSTRAINT `order_histories_userIdx_fkey` FOREIGN KEY (`userIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `travel_stat_buckets` ADD CONSTRAINT `travel_stat_buckets_destination_fkey` FOREIGN KEY (`destination`) REFERENCES `travel_stats`(`destination`) ON DELETE CASCADE ON UPDATE CASCADE;

