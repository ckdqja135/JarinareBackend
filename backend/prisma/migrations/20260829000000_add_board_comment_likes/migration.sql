-- 좋아요 기능(게시글/댓글)의 스키마가 schema.prisma 에만 있고 마이그레이션에는
-- 빠져 있어, 새 DB 에 배포하면 boards.liked 부재로 좋아요·알림이 동작하지 않았다.
-- 그 누락분을 채운다.
--
-- comments.isDeleted 는 소프트 삭제용으로 추가됐다가 하드 삭제로 바뀌면서
-- 스키마·코드 어디에서도 쓰지 않는 컬럼이 됐다(comment.service 의 remove 는
-- comment.delete 를 쓴다). 남겨 두면 계속 드리프트로 잡히므로 함께 정리한다.
--
-- board_likes / comment_likes 는 신규 테이블이라 기존 좋아요 데이터가 없다.
-- 따라서 liked 카운터는 0 으로 시작해도 정합성이 맞는다(백필 불필요).

-- AlterTable
ALTER TABLE `boards` ADD COLUMN `liked` BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `comments` DROP COLUMN `isDeleted`,
    ADD COLUMN `liked` BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `comment_likes` (
    `commentId` BIGINT NOT NULL,
    `userIdx` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `comment_likes_commentId_userIdx_key`(`commentId`, `userIdx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `board_likes` (
    `boardId` BIGINT NOT NULL,
    `userIdx` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `board_likes_boardId_userIdx_key`(`boardId`, `userIdx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `comment_likes` ADD CONSTRAINT `comment_likes_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_likes` ADD CONSTRAINT `comment_likes_userIdx_fkey` FOREIGN KEY (`userIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `board_likes` ADD CONSTRAINT `board_likes_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `boards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `board_likes` ADD CONSTRAINT `board_likes_userIdx_fkey` FOREIGN KEY (`userIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;

