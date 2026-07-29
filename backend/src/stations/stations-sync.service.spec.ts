// cron 은 실제 타이머를 만들지 않도록 목으로 대체한다.
jest.mock('cron', () => ({
  CronJob: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
}));

import { StationsSyncService } from './stations-sync.service';
import { AppException } from '../common/errors/app.exception';

/** 외부 API 봉투 형태를 만드는 헬퍼 */
function envelope(items: unknown, totalCount: number) {
  return {
    response: {
      header: { resultCode: '00', resultMsg: 'OK' },
      body: { items, totalCount, numOfRows: 200, pageNo: 1 },
    },
  };
}

function makeItems(count: number, prefix = 'NAT') {
  return Array.from({ length: count }, (_, i) => ({
    nodeid: `${prefix}${String(i).padStart(6, '0')}`,
    nodename: `역${i}`,
  }));
}

describe('StationsSyncService', () => {
  let client: { get: jest.Mock };
  let prisma: {
    station: {
      count: jest.Mock;
      upsert: jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let config: Record<string, unknown>;
  let scheduler: { doesExist: jest.Mock; addCronJob: jest.Mock };
  let jobQueue: { enqueue: jest.Mock };
  let service: StationsSyncService;

  beforeEach(() => {
    client = { get: jest.fn() };
    const tx = {
      station: {
        upsert: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    prisma = {
      station: {
        count: jest.fn().mockResolvedValue(0),
        upsert: jest.fn(),
        updateMany: jest.fn(),
      },
      // $transaction(fn) 은 트랜잭션 클라이언트를 넘겨 즉시 실행한다.
      $transaction: jest.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
    };
    (prisma as unknown as { _tx: typeof tx })._tx = tx;
    config = {
      stationSyncCron: '0 0 * * *',
      timezone: 'Asia/Seoul',
      stationSyncInitialEnabled: false,
    };
    scheduler = {
      doesExist: jest.fn().mockReturnValue(false),
      addCronJob: jest.fn(),
    };
    // enqueue 는 적재 즉시 jobFn 을 실행해 기존 syncAll 검증을 그대로 유지한다.
    jobQueue = {
      enqueue: jest.fn(
        (params: { jobFn: (runId: bigint) => unknown }) =>
          Promise.resolve(params.jobFn(1n)) as Promise<unknown>,
      ),
    };
    service = new StationsSyncService(
      client as never,
      prisma as never,
      config as never,
      scheduler as never,
      jobQueue as never,
    );
  });

  describe('fetchCityStations - 외부 응답 파싱', () => {
    it('배열 응답을 파싱한다', async () => {
      client.get.mockResolvedValueOnce(envelope({ item: makeItems(3) }, 3));
      const result = await service.fetchCityStations('11');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ nodeid: 'NAT000000', nodename: '역0' });
    });

    it('단일 객체 응답을 배열로 정규화한다', async () => {
      client.get.mockResolvedValueOnce(
        envelope({ item: { nodeid: 'NAT010000', nodename: '서울역' } }, 1),
      );
      const result = await service.fetchCityStations('11');
      expect(result).toEqual([{ nodeid: 'NAT010000', nodename: '서울역' }]);
    });

    it('빈 응답(items="")을 빈 배열로 처리한다', async () => {
      client.get.mockResolvedValueOnce(envelope('', 0));
      const result = await service.fetchCityStations('11');
      expect(result).toEqual([]);
    });

    it('nodeid 기준으로 중복을 제거한다', async () => {
      client.get.mockResolvedValueOnce(
        envelope(
          {
            item: [
              { nodeid: 'A', nodename: '가' },
              { nodeid: 'A', nodename: '가중복' },
              { nodeid: 'B', nodename: '나' },
            ],
          },
          3,
        ),
      );
      const result = await service.fetchCityStations('11');
      expect(result).toEqual([
        { nodeid: 'A', nodename: '가' },
        { nodeid: 'B', nodename: '나' },
      ]);
    });

    it('numOfRows 를 초과하면 다음 페이지까지 조회한다', async () => {
      client.get
        .mockResolvedValueOnce(envelope({ item: makeItems(200, 'P1_') }, 250))
        .mockResolvedValueOnce(envelope({ item: makeItems(50, 'P2_') }, 250));
      const result = await service.fetchCityStations('11');
      expect(client.get).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(250);
    });

    it('마지막 페이지(< numOfRows)면 추가 호출하지 않는다', async () => {
      client.get.mockResolvedValueOnce(envelope({ item: makeItems(10) }, 10));
      await service.fetchCityStations('11');
      expect(client.get).toHaveBeenCalledTimes(1);
    });

    it('응답 형식이 잘못되면 외부 오류로 변환한다', async () => {
      client.get.mockResolvedValueOnce({ nope: true });
      await expect(service.fetchCityStations('11')).rejects.toBeInstanceOf(
        AppException,
      );
    });
  });

  describe('syncAll - 동기화 정책', () => {
    it('모든 도시 실패 시 기존 데이터를 유지한다(쓰기 없음)', async () => {
      jest
        .spyOn(service, 'fetchCityStations')
        .mockRejectedValue(new Error('network'));
      const result = await service.syncAll();
      expect(result.syncedCities).toBe(0);
      expect(result.upserted).toBe(0);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('일부 도시만 성공하면 성공한 도시만 반영한다', async () => {
      jest
        .spyOn(service, 'fetchCityStations')
        .mockImplementation((city: string) =>
          city === '11'
            ? Promise.resolve([{ nodeid: 'A', nodename: '가' }])
            : Promise.reject(new Error('fail')),
        );
      const result = await service.syncAll();
      expect(result.syncedCities).toBe(1);
      expect(result.failedCities).toBeGreaterThan(0);
      expect(result.upserted).toBe(1);
      const tx = (
        prisma as unknown as { _tx: { station: { upsert: jest.Mock } } }
      )._tx;
      expect(tx.station.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { nodeid: 'A' } }),
      );
    });
  });

  describe('스케줄러 등록', () => {
    it('onModuleInit 에서 자정 크론 작업을 등록한다', () => {
      service.onModuleInit();
      expect(scheduler.addCronJob).toHaveBeenCalledTimes(1);
      expect(scheduler.addCronJob).toHaveBeenCalledWith(
        'station-sync',
        expect.anything(),
      );
    });
  });
});
