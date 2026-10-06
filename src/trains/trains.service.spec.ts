import { TrainsService } from "./trains.service";
import { ErrorCode } from "../common/errors/error-code";
import { TrainTimeQueryDto } from "./dto/train-time-query.dto";

function envelope(items: unknown) {
  return {
    response: {
      header: { resultCode: "00" },
      body: { items },
    },
  };
}

function query(partial: Partial<TrainTimeQueryDto>): TrainTimeQueryDto {
  return {
    depPlaceId: "NAT010000",
    arrPlaceId: "NAT011668",
    depPlandTime: "20260725",
    ...partial,
  };
}

type Where = {
  depPlaceId: string;
  arrPlaceId: string;
  depPlandTime: string;
  pageNo: number;
  numOfRows: number;
};

const keyOf = (w: Where) =>
  `${w.depPlaceId}|${w.arrPlaceId}|${w.depPlandTime}|${w.pageNo}|${w.numOfRows}`;

describe("TrainsService", () => {
  let client: { get: jest.Mock };
  // stations_times 캐시를 흉내내는 인메모리 스토어
  let store: Map<string, { data: unknown }>;
  let prisma: { stationTime: { findUnique: jest.Mock; upsert: jest.Mock } };
  let service: TrainsService;

  beforeEach(() => {
    client = { get: jest.fn() };
    store = new Map();
    prisma = {
      stationTime: {
        findUnique: jest.fn(
          ({
            where,
          }: {
            where: {
              depPlaceId_arrPlaceId_depPlandTime_pageNo_numOfRows: Where;
            };
          }) =>
            Promise.resolve(
              store.get(
                keyOf(
                  where.depPlaceId_arrPlaceId_depPlandTime_pageNo_numOfRows,
                ),
              ) ?? null,
            ),
        ),
        upsert: jest.fn(
          ({
            where,
            create,
          }: {
            where: {
              depPlaceId_arrPlaceId_depPlandTime_pageNo_numOfRows: Where;
            };
            create: Where & { data: unknown };
          }) => {
            store.set(
              keyOf(where.depPlaceId_arrPlaceId_depPlandTime_pageNo_numOfRows),
              { data: create.data },
            );
            return Promise.resolve({});
          },
        ),
      },
    };
    service = new TrainsService(client as never, prisma as never);
  });

  it("출발역과 도착역이 같으면 검증 오류", async () => {
    await expect(
      service.getTrainTimes(query({ arrPlaceId: "NAT010000" })),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_TRAIN_SEARCH_PARAMETER,
    });
  });

  it("잘못된 날짜 형식이면 INVALID_DEPARTURE_DATE", async () => {
    await expect(
      service.getTrainTimes(query({ depPlandTime: "20261340" })),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_DEPARTURE_DATE });
  });

  it("배열 응답을 변환하고 숫자 문자열을 number 로 바꾼다", async () => {
    client.get.mockResolvedValue(
      envelope({
        item: [
          {
            adultcharge: "23700",
            arrplacename: "부산",
            arrplandtime: "202607251230",
            depplacename: "서울",
            depplandtime: "202607250900",
            traingradename: "KTX",
            trainno: "101",
            unusedField: "x",
          },
        ],
      }),
    );
    const result = await service.getTrainTimes(query({}));
    expect(result).toEqual([
      {
        adultcharge: 23700,
        arrplacename: "부산",
        arrplandtime: 202607251230,
        depplacename: "서울",
        depplandtime: 202607250900,
        traingradename: "KTX",
        trainno: 101,
      },
    ]);
    // 사용하지 않는 필드는 제거된다.
    expect(result[0]).not.toHaveProperty("unusedField");
  });

  it("단일 객체 응답을 배열로 정규화한다", async () => {
    client.get.mockResolvedValue(
      envelope({
        item: {
          adultcharge: 100,
          arrplacename: "부산",
          arrplandtime: 202607251230,
          depplacename: "서울",
          depplandtime: 202607250900,
          traingradename: "KTX",
          trainno: 1,
        },
      }),
    );
    const result = await service.getTrainTimes(query({}));
    expect(result).toHaveLength(1);
  });

  it("결과가 없으면 빈 배열", async () => {
    client.get.mockResolvedValue(envelope(""));
    const result = await service.getTrainTimes(query({}));
    expect(result).toEqual([]);
  });

  it("외부 API 오류를 EXTERNAL_TRAIN_API_ERROR 로 변환한다", async () => {
    client.get.mockRejectedValue(new Error("boom"));
    await expect(service.getTrainTimes(query({}))).rejects.toMatchObject({
      code: ErrorCode.EXTERNAL_TRAIN_API_ERROR,
    });
  });

  it("동일 조건 반복 요청은 캐시로 처리한다(외부 1회 호출)", async () => {
    client.get.mockResolvedValue(envelope({ item: [] }));
    await service.getTrainTimes(query({}));
    await service.getTrainTimes(query({}));
    expect(client.get).toHaveBeenCalledTimes(1);
  });

  describe("refreshTrainTimes", () => {
    it("캐시가 있어도 항상 외부 API 를 새로 호출해 저장한다", async () => {
      client.get.mockResolvedValue(envelope({ item: [] }));
      // 먼저 캐시를 채운다.
      await service.getTrainTimes(query({}));
      expect(client.get).toHaveBeenCalledTimes(1);

      // refresh 는 캐시를 무시하고 다시 호출한다.
      await service.refreshTrainTimes({
        depPlaceId: "NAT010000",
        arrPlaceId: "NAT011668",
        depPlandTime: "20260725",
      });
      expect(client.get).toHaveBeenCalledTimes(2);
      expect(prisma.stationTime.upsert).toHaveBeenCalledTimes(2);
    });

    it("외부 API 오류를 EXTERNAL_TRAIN_API_ERROR 로 변환한다", async () => {
      client.get.mockRejectedValue(new Error("boom"));
      await expect(
        service.refreshTrainTimes({
          depPlaceId: "NAT010000",
          arrPlaceId: "NAT011668",
          depPlandTime: "20260725",
        }),
      ).rejects.toMatchObject({ code: ErrorCode.EXTERNAL_TRAIN_API_ERROR });
    });
  });
});
