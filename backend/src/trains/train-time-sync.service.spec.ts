// cron 은 실제 타이머를 만들지 않도록 목으로 대체한다.
jest.mock('cron', () => ({
  CronJob: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
}));

import { TrainTimeSyncService } from './train-time-sync.service';
import { TRAIN_ROUTES } from './constants/train-routes';
import { AppException } from '../common/errors/app.exception';

const VALID_ROUTES = TRAIN_ROUTES.filter(
  (r) => r.depPlaceId !== r.arrPlaceId,
).length;

describe('TrainTimeSyncService', () => {
  let trains: { refreshTrainTimes: jest.Mock };
  let prisma: { stationTime: { count: jest.Mock } };
  let config: Record<string, unknown>;
  let lock: { runExclusive: jest.Mock };
  let scheduler: { doesExist: jest.Mock; addCronJob: jest.Mock };
  let service: TrainTimeSyncService;

  beforeEach(() => {
    trains = { refreshTrainTimes: jest.fn().mockResolvedValue([]) };
    prisma = { stationTime: { count: jest.fn().mockResolvedValue(0) } };
    config = {
      timezone: 'Asia/Seoul',
      trainTimeSyncCron: '0 4 * * *',
      trainTimeSyncInitialEnabled: false,
      trainTimeSyncDays: 2,
      trainTimeSyncConcurrency: 2,
    };
    lock = {
      // 락을 항상 획득한 것으로 간주하고 작업을 즉시 실행한다.
      runExclusive: jest.fn((_name: string, _ttl: number, fn: () => unknown) =>
        fn(),
      ),
    };
    scheduler = {
      doesExist: jest.fn().mockReturnValue(false),
      addCronJob: jest.fn(),
    };
    service = new TrainTimeSyncService(
      trains as never,
      prisma as never,
      config as never,
      lock as never,
      scheduler as never,
    );
  });

  describe('스케줄러 등록', () => {
    it('onModuleInit 에서 열차시간 크론 작업을 등록한다', () => {
      service.onModuleInit();
      expect(scheduler.addCronJob).toHaveBeenCalledTimes(1);
      expect(scheduler.addCronJob).toHaveBeenCalledWith(
        'train-time-sync',
        expect.anything(),
      );
    });
  });

  describe('syncScheduled - 오늘 포함 N일', () => {
    it('노선×날짜 만큼 refreshTrainTimes 를 호출하고 결과를 집계한다', async () => {
      const result = await service.syncScheduled();
      expect(result.executed).toBe(true);
      expect(result.routes).toBe(VALID_ROUTES);
      expect(result.dates).toHaveLength(2); // trainTimeSyncDays=2
      expect(result.tasks).toBe(VALID_ROUTES * 2);
      expect(result.succeeded).toBe(VALID_ROUTES * 2);
      expect(result.failed).toBe(0);
      expect(trains.refreshTrainTimes).toHaveBeenCalledTimes(VALID_ROUTES * 2);
    });

    it('일부 작업이 실패해도 나머지는 저장한다(부분 실패 허용)', async () => {
      trains.refreshTrainTimes
        .mockRejectedValueOnce(new Error('external down'))
        .mockResolvedValue([]);
      const result = await service.syncScheduled();
      expect(result.executed).toBe(true);
      expect(result.failed).toBe(1);
      expect(result.succeeded).toBe(VALID_ROUTES * 2 - 1);
    });

    it('다른 실행이 진행 중이면 건너뛴다', async () => {
      lock.runExclusive.mockResolvedValueOnce(null);
      const result = await service.syncScheduled();
      expect(result.executed).toBe(false);
      expect(trains.refreshTrainTimes).not.toHaveBeenCalled();
    });
  });

  describe('syncRange - 수동 기간 선택', () => {
    it('startDate + days 로 날짜 목록을 만든다', async () => {
      const result = await service.syncRange({ startDate: '20260728', days: 3 });
      expect(result.dates).toEqual(['20260728', '20260729', '20260730']);
      expect(result.tasks).toBe(VALID_ROUTES * 3);
    });

    it('startDate + endDate(포함) 로 날짜 목록을 만든다', async () => {
      const result = await service.syncRange({
        startDate: '20260730',
        endDate: '20260801',
      });
      // 월 경계를 넘어 3일(30,31,01)
      expect(result.dates).toEqual(['20260730', '20260731', '20260801']);
    });

    it('endDate 가 startDate 보다 이르면 검증 오류', async () => {
      await expect(
        service.syncRange({ startDate: '20260728', endDate: '20260720' }),
      ).rejects.toBeInstanceOf(AppException);
    });

    it('최대 기간(31일)을 초과하면 검증 오류', async () => {
      await expect(
        service.syncRange({ startDate: '20260101', endDate: '20260301' }),
      ).rejects.toBeInstanceOf(AppException);
    });

    it('잘못된 날짜(존재하지 않는 달력일)면 검증 오류', async () => {
      await expect(
        service.syncRange({ startDate: '20260230' }),
      ).rejects.toBeInstanceOf(AppException);
    });
  });
});
