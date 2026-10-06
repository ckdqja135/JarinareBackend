// @role: features/seat
// @rule: 호차 좌석 배치도(영화의 "상영관") 조회만 담당
import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { DEFAULT_LAYOUT } from "./seat.constants";

export interface SeatSlotDto {
  seatId: string;
  rowNo: number;
  colLabel: string;
  side: string;
  isWindow: boolean;
}

export interface CarLayoutDto {
  carNo: number;
  rowCount: number;
  totalSeats: number;
  /** 통로를 기준으로 나뉜 열 묶음. 예) [["A","B"],["C","D"]] */
  columns: string[][];
  seats: SeatSlotDto[];
}

/** 배치도는 거의 바뀌지 않으므로 잠깐 메모리에 둔다 */
const CACHE_TTL_MS = 5 * 60_000;

@Injectable()
export class SeatLayoutService {
  private readonly cache = new Map<
    string,
    { at: number; cars: CarLayoutDto[] }
  >();

  constructor(private readonly prisma: PrismaService) {}

  /** 열차 종류 전용 배치를 찾고, 없으면 기본 배치로 떨어진다. */
  async getCars(trainType: string, carNo?: number): Promise<CarLayoutDto[]> {
    const own = await this.load(trainType);
    const all = own.length > 0 ? own : await this.load(DEFAULT_LAYOUT);
    const cars =
      carNo === undefined ? all : all.filter((c) => c.carNo === carNo);
    if (cars.length === 0) {
      throw new AppException(
        ErrorCode.SEAT_NOT_FOUND,
        carNo === undefined
          ? "좌석 배치를 찾을 수 없습니다."
          : `${carNo}호차는 없는 호차입니다.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return cars;
  }

  async getCar(trainType: string, carNo: number): Promise<CarLayoutDto> {
    return (await this.getCars(trainType, carNo))[0];
  }

  /** 배치도에 없는 좌석 번호로 선점·예매되는 것을 막는다. */
  async assertSeatsExist(
    trainType: string,
    carNo: number,
    seatIds: string[],
  ): Promise<void> {
    const car = await this.getCar(trainType, carNo);
    const known = new Set(car.seats.map((s) => s.seatId));
    const unknown = seatIds.filter((id) => !known.has(id));
    if (unknown.length > 0) {
      throw new AppException(
        ErrorCode.SEAT_NOT_FOUND,
        `${carNo}호차에 없는 좌석입니다: ${unknown.join(", ")}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async load(trainType: string): Promise<CarLayoutDto[]> {
    const hit = this.cache.get(trainType);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.cars;

    const layouts = await this.prisma.carLayout.findMany({
      where: { trainType },
      orderBy: { carNo: "asc" },
      include: { seats: { orderBy: [{ rowNo: "asc" }, { colLabel: "asc" }] } },
    });
    const cars = layouts.map((l) => ({
      carNo: l.carNo,
      rowCount: l.rowCount,
      totalSeats: l.totalSeats,
      columns: toColumns(l.seats),
      seats: l.seats.map(({ seatId, rowNo, colLabel, side, isWindow }) => ({
        seatId,
        rowNo,
        colLabel,
        side,
        isWindow,
      })),
    }));
    this.cache.set(trainType, { at: Date.now(), cars });
    return cars;
  }
}

/** 좌석 목록에서 통로 기준 열 묶음을 만든다 — 프론트가 A B | C D 를 그리는 데 쓴다. */
function toColumns(seats: { colLabel: string; side: string }[]): string[][] {
  const bySide = new Map<string, Set<string>>();
  for (const s of seats) {
    const cols = bySide.get(s.side) ?? new Set<string>();
    cols.add(s.colLabel);
    bySide.set(s.side, cols);
  }
  return ["left", "right"]
    .filter((side) => bySide.has(side))
    .map((side) => [...bySide.get(side)!].sort());
}
