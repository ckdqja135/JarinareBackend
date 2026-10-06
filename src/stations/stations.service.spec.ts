import { StationsService } from "./stations.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";

describe("StationsService", () => {
  let prisma: {
    station: { findMany: jest.Mock; findFirst: jest.Mock };
  };
  let service: StationsService;

  beforeEach(() => {
    prisma = {
      station: { findMany: jest.fn(), findFirst: jest.fn() },
    };
    service = new StationsService(prisma as never);
  });

  it("활성 역 전체를 조회한다", async () => {
    prisma.station.findMany.mockResolvedValue([
      { nodeid: "A", nodename: "가" },
    ]);
    const result = await service.findAll();
    expect(result).toEqual([{ nodeid: "A", nodename: "가" }]);
    expect(prisma.station.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
  });

  it("도시별로 역을 조회한다", async () => {
    prisma.station.findMany.mockResolvedValue([]);
    await service.findByCity("11");
    expect(prisma.station.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true, cityCode: "11" } }),
    );
  });

  it("없는 역 조회 시 STATION_NOT_FOUND(404)", async () => {
    prisma.station.findFirst.mockResolvedValue(null);
    await expect(service.findById("X")).rejects.toMatchObject({
      code: ErrorCode.STATION_NOT_FOUND,
    });
    await expect(service.findById("X")).rejects.toBeInstanceOf(AppException);
  });
});
