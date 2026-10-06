-- CreateTable
CREATE TABLE `car_layouts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trainType` VARCHAR(20) NOT NULL,
    `carNo` INTEGER NOT NULL,
    `rowCount` INTEGER NOT NULL,
    `totalSeats` INTEGER NOT NULL,

    UNIQUE INDEX `car_layouts_trainType_carNo_key`(`trainType`, `carNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seat_slots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `layoutId` INTEGER NOT NULL,
    `seatId` VARCHAR(8) NOT NULL,
    `rowNo` INTEGER NOT NULL,
    `colLabel` VARCHAR(2) NOT NULL,
    `side` VARCHAR(8) NOT NULL,
    `isWindow` BOOLEAN NOT NULL DEFAULT false,

    INDEX `seat_slots_layoutId_rowNo_idx`(`layoutId`, `rowNo`),
    UNIQUE INDEX `seat_slots_layoutId_seatId_key`(`layoutId`, `seatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `train_trips` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `trainNo` VARCHAR(20) NOT NULL,
    `trainType` VARCHAR(20) NOT NULL,
    `depPlaceId` VARCHAR(40) NOT NULL,
    `arrPlaceId` VARCHAR(40) NOT NULL,
    `depPlandTime` VARCHAR(14) NOT NULL,
    `arrPlandTime` VARCHAR(14) NOT NULL,
    `depName` VARCHAR(100) NOT NULL,
    `arrName` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `train_trips_depPlandTime_idx`(`depPlandTime`),
    UNIQUE INDEX `train_trips_trainNo_depPlaceId_arrPlaceId_depPlandTime_key`(`trainNo`, `depPlaceId`, `arrPlaceId`, `depPlandTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seat_holds` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tripId` BIGINT NOT NULL,
    `carNo` INTEGER NOT NULL,
    `seatId` VARCHAR(8) NOT NULL,
    `userIdx` BIGINT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `seat_holds_expiresAt_idx`(`expiresAt`),
    INDEX `seat_holds_userIdx_tripId_idx`(`userIdx`, `tripId`),
    UNIQUE INDEX `seat_holds_tripId_carNo_seatId_key`(`tripId`, `carNo`, `seatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tripId` BIGINT NOT NULL,
    `carNo` INTEGER NOT NULL,
    `seatId` VARCHAR(8) NOT NULL,
    `userIdx` BIGINT NOT NULL,
    `orderId` VARCHAR(36) NOT NULL,
    `passengerType` VARCHAR(10) NOT NULL,
    `price` INTEGER NOT NULL DEFAULT 0,
    `canceledAt` DATETIME(3) NOT NULL DEFAULT '1970-01-01 00:00:00.000',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reservations_userIdx_createdAt_idx`(`userIdx`, `createdAt`),
    INDEX `reservations_orderId_idx`(`orderId`),
    UNIQUE INDEX `reservations_tripId_carNo_seatId_canceledAt_key`(`tripId`, `carNo`, `seatId`, `canceledAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seat_change_requests` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tripId` BIGINT NOT NULL,
    `requesterIdx` BIGINT NOT NULL,
    `targetIdx` BIGINT NOT NULL,
    `fromSeats` JSON NOT NULL,
    `toSeats` JSON NOT NULL,
    `emptySeats` JSON NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `expiresAt` DATETIME(3) NOT NULL,
    `respondedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `seat_change_requests_targetIdx_status_idx`(`targetIdx`, `status`),
    INDEX `seat_change_requests_requesterIdx_status_idx`(`requesterIdx`, `status`),
    INDEX `seat_change_requests_status_expiresAt_idx`(`status`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `seat_slots` ADD CONSTRAINT `seat_slots_layoutId_fkey` FOREIGN KEY (`layoutId`) REFERENCES `car_layouts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seat_holds` ADD CONSTRAINT `seat_holds_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `train_trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seat_holds` ADD CONSTRAINT `seat_holds_userIdx_fkey` FOREIGN KEY (`userIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `train_trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_userIdx_fkey` FOREIGN KEY (`userIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seat_change_requests` ADD CONSTRAINT `seat_change_requests_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `train_trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seat_change_requests` ADD CONSTRAINT `seat_change_requests_requesterIdx_fkey` FOREIGN KEY (`requesterIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seat_change_requests` ADD CONSTRAINT `seat_change_requests_targetIdx_fkey` FOREIGN KEY (`targetIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 시드: 기본 좌석 배치도
--
-- 프론트에 하드코딩돼 있던 값(ReserveConstants.ts seatsRows, SeatCheckList.tsx)을
-- 그대로 옮긴다. 6행 × (A B | 통로 | C D) = 호차당 24석, 1~4호차.
-- 열차 종류별 배치가 따로 없으면 서비스가 'DEFAULT' 로 떨어진다.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO `car_layouts` (`trainType`, `carNo`, `rowCount`, `totalSeats`) VALUES
  ('DEFAULT', 1, 6, 24),
  ('DEFAULT', 2, 6, 24),
  ('DEFAULT', 3, 6, 24),
  ('DEFAULT', 4, 6, 24);

INSERT INTO `seat_slots` (`layoutId`, `seatId`, `rowNo`, `colLabel`, `side`, `isWindow`)
SELECT l.`id`,
       CONCAT(c.`col`, r.`rowNo`),
       r.`rowNo`,
       c.`col`,
       c.`side`,
       c.`isWindow`
FROM `car_layouts` l
CROSS JOIN (SELECT 1 AS `rowNo` UNION ALL SELECT 2 UNION ALL SELECT 3
            UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) r
CROSS JOIN (SELECT 'A' AS `col`, 'left'  AS `side`, TRUE  AS `isWindow`
            UNION ALL SELECT 'B', 'left',  FALSE
            UNION ALL SELECT 'C', 'right', FALSE
            UNION ALL SELECT 'D', 'right', TRUE) c
WHERE l.`trainType` = 'DEFAULT';
