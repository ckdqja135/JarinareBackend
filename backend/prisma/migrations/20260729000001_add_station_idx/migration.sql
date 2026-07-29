-- stations: 대리 기본키 idx 추가. 기본키를 nodeid → idx 로 교체하고 nodeid 는 유니크로 유지한다.
-- (nodeid 는 upsert / 중복제거 기준이라 유니크 제약이 반드시 필요하다.)
-- AlterTable
ALTER TABLE `stations` DROP PRIMARY KEY,
    ADD COLUMN `idx` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;

-- CreateIndex
CREATE UNIQUE INDEX `stations_nodeid_key` ON `stations`(`nodeid`);
