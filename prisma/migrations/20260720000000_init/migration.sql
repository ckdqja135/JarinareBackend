-- CreateTable
CREATE TABLE `users` (
    `uid` VARCHAR(128) NOT NULL,
    `userId` VARCHAR(128) NOT NULL,
    `name` VARCHAR(50) NOT NULL DEFAULT '',
    `email` VARCHAR(190) NULL,
    `age` VARCHAR(10) NOT NULL DEFAULT '',
    `gender` VARCHAR(10) NOT NULL DEFAULT '',
    `changeCount` INTEGER NOT NULL DEFAULT 0,
    `point` INTEGER NOT NULL DEFAULT 0,
    `change` BOOLEAN NOT NULL DEFAULT true,
    `response` BOOLEAN NOT NULL DEFAULT true,
    `role` VARCHAR(20) NOT NULL DEFAULT 'user',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `users_userId_idx`(`userId`),
    PRIMARY KEY (`uid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stations` (
    `nodeid` VARCHAR(40) NOT NULL,
    `nodename` VARCHAR(100) NOT NULL,
    `cityCode` VARCHAR(10) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `syncedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `stations_cityCode_idx`(`cityCode`),
    INDEX `stations_isActive_idx`(`isActive`),
    PRIMARY KEY (`nodeid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sync_locks` (
    `name` VARCHAR(100) NOT NULL,
    `lockedBy` VARCHAR(120) NOT NULL,
    `lockedAt` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

