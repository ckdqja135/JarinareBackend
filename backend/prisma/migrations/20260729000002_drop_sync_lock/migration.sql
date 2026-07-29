-- sync_locks 테이블 제거.
-- 분산 락(DbLockService)을 걷어내고, 중복 실행 방지는 큐(scheduler_run_log)의
-- 단일 워커 + PENDING/RUNNING 중복 검사로 대체한다.
-- DropTable
DROP TABLE IF EXISTS `sync_locks`;
