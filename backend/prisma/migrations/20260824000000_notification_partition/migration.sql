-- notifications 테이블을 RANGE 파티셔닝 구조로 재생성
-- MySQL은 파티션 테이블에서 외래 키(FK)를 지원하지 않으므로 FK 제거
-- PK를 (id, createdAt) 복합키로 변경 (MySQL RANGE 파티셔닝 요구사항)
-- 이번달 + 다음달만 생성, 이후 파티션은 크론이 매월 1일에 ADD PARTITION으로 추가
DROP TABLE IF EXISTS `notifications`;

CREATE TABLE `notifications` (
    `id`        BIGINT      NOT NULL AUTO_INCREMENT,
    `userIdx`   BIGINT      NOT NULL,
    `type`      VARCHAR(20) NOT NULL,
    `isRead`    BOOLEAN     NOT NULL DEFAULT FALSE,
    `payload`   JSON        NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`, `createdAt`),
    INDEX `notifications_userIdx_createdAt_idx` (`userIdx`, `createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  PARTITION BY RANGE (YEAR(`createdAt`) * 100 + MONTH(`createdAt`)) (
    PARTITION p_2026_08 VALUES LESS THAN (202609),
    PARTITION p_2026_09 VALUES LESS THAN (202610)
  );
