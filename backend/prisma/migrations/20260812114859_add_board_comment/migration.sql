-- CreateTable
CREATE TABLE `boards` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(20) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `authorIdx` BIGINT NOT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `tags` JSON NULL,
    `rating` DECIMAL(3, 1) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `boards_type_idx`(`type`),
    INDEX `boards_authorIdx_idx`(`authorIdx`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `boardId` BIGINT NOT NULL,
    `authorIdx` BIGINT NOT NULL,
    `content` TEXT NOT NULL,
    `parentId` BIGINT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `comments_boardId_idx`(`boardId`),
    INDEX `comments_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `boards` ADD CONSTRAINT `boards_authorIdx_fkey` FOREIGN KEY (`authorIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `boards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_authorIdx_fkey` FOREIGN KEY (`authorIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;
