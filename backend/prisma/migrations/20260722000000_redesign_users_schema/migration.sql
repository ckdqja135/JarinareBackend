-- AlterTable: users 스키마 재설계
-- uid(Firebase UID) PK 제거 → idx(BigInt autoincrement) PK 로 교체
-- password 추가 (소셜 로그인은 NULL)
-- changeCount → seatChageCount
-- change → notifiChange
-- response → notifResponse
-- email UNIQUE 제약 추가

ALTER TABLE `users`
  DROP PRIMARY KEY,
  DROP COLUMN `uid`,
  DROP COLUMN `changeCount`,
  DROP COLUMN `change`,
  DROP COLUMN `response`,
  ADD COLUMN `idx` BIGINT NOT NULL AUTO_INCREMENT FIRST,
  ADD COLUMN `password` VARCHAR(255) NULL,
  ADD COLUMN `seatChageCount` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `notifiChange` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `notifResponse` BOOLEAN NOT NULL DEFAULT true,
  ADD PRIMARY KEY (`idx`),
  ADD UNIQUE INDEX `users_email_key`(`email`);
