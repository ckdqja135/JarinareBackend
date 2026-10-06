-- 파티션 프루닝이 동작하지 않던 문제 수정.
--
-- 기존 파티션 식은 RANGE (YEAR(createdAt) * 100 + MONTH(createdAt)) 였다.
-- MySQL/MariaDB 옵티마이저가 프루닝에 쓸 수 있는 형태는
-- RANGE COLUMNS(col) 이거나 RANGE(TO_DAYS/YEAR/TO_SECONDS/UNIX_TIMESTAMP(col)) 뿐이라,
-- 임의 산술식은 역산이 안 돼 어떤 createdAt 필터를 걸어도 전체 파티션을 훑었다.
-- (EXPLAIN PARTITIONS 로 확인: 9월만 조회해도 p_2026_08 까지 스캔)
--
-- RANGE COLUMNS(createdAt) 는 경계값을 날짜 그대로 비교하므로 프루닝이 산다.
-- ALTER ... PARTITION BY 는 테이블을 재구성하되 데이터는 보존한다
-- (기존 마이그레이션의 DROP TABLE 과 달리 알림이 날아가지 않는다).
--
-- 경계는 기존과 동일한 월 단위이며 같은 행이 같은 파티션에 남는다.
-- 이후 월은 크론(createNextMonthPartition)이 매월 1일에 ADD PARTITION 한다.
ALTER TABLE `notifications`
  PARTITION BY RANGE COLUMNS(`createdAt`) (
    PARTITION p_2026_08 VALUES LESS THAN ('2026-09-01 00:00:00.000'),
    PARTITION p_2026_09 VALUES LESS THAN ('2026-10-01 00:00:00.000')
  );
