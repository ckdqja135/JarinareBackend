-- 20260828000000_notification_partition_yearly 를 RANGE COLUMNS 에 맞게 다시 한 것.
--
-- 그 마이그레이션은 정수 경계(LESS THAN (202611))를 쓰는데, 20260829000100 에서
-- 파티션이 RANGE COLUMNS(createdAt) 로 바뀌었으므로 날짜 경계만 받는다.
-- 그 결과 10월부터는 들어갈 파티션이 없어 알림 INSERT 가 전부 실패했다
-- (ER_NO_PARTITION_FOR_GIVEN_VALUE).
--
-- 범위는 원래 의도와 같다: 기존 p_2026_08, p_2026_09 + 10개 = 1년치.
-- 이후는 rotateYearlyPartitions() 크론이 같은 날짜 경계로 이어 간다.
--
-- 20260829000100 이 먼저 적용된 DB(test 등)에서는 20260828000000 을 실행할 수 없으므로
-- `prisma migrate resolve --applied 20260828000000_notification_partition_yearly`
-- 로 건너뛴 뒤 이 마이그레이션을 적용한다.
ALTER TABLE `notifications` ADD PARTITION (
  PARTITION p_2026_10 VALUES LESS THAN ('2026-11-01 00:00:00.000'),
  PARTITION p_2026_11 VALUES LESS THAN ('2026-12-01 00:00:00.000'),
  PARTITION p_2026_12 VALUES LESS THAN ('2027-01-01 00:00:00.000'),
  PARTITION p_2027_01 VALUES LESS THAN ('2027-02-01 00:00:00.000'),
  PARTITION p_2027_02 VALUES LESS THAN ('2027-03-01 00:00:00.000'),
  PARTITION p_2027_03 VALUES LESS THAN ('2027-04-01 00:00:00.000'),
  PARTITION p_2027_04 VALUES LESS THAN ('2027-05-01 00:00:00.000'),
  PARTITION p_2027_05 VALUES LESS THAN ('2027-06-01 00:00:00.000'),
  PARTITION p_2027_06 VALUES LESS THAN ('2027-07-01 00:00:00.000'),
  PARTITION p_2027_07 VALUES LESS THAN ('2027-08-01 00:00:00.000')
);
