import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-code';
import { PublicDataClient } from '../external/public-data.client';
import { PrismaService } from '../prisma/prisma.service';
import { TrainTimeQueryDto } from './dto/train-time-query.dto';
import { TrainTimeResponseDto } from './dto/train-time-response.dto';
import type { Prisma } from '../generated/prisma/client';

const TRAIN_TIME_PATH = '/GetStrtpntAlocFndTrainInfo';

type StationTimeWhereUnique = {
  depPlaceId: string;
  arrPlaceId: string;
  depPlandTime: string;
  pageNo: number;
  numOfRows: number;
};

@Injectable()
export class TrainsService {
  private readonly logger = new Logger(TrainsService.name);

  constructor(
    private readonly client: PublicDataClient,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 열차 시간 조회.
   *  - DB에 캐시된 데이터가 있으면 공공데이터 API 호출 없이 DB에서 반환
   *  - 없으면 공공데이터 API 호출 → DB 저장 → 반환
   */
  async getTrainTimes(
    query: TrainTimeQueryDto,
  ): Promise<TrainTimeResponseDto[]> {
    const { depPlaceId, arrPlaceId, depPlandTime, trainGradeCode } = query;
    const pageNo = query.pageNo ?? 1;
    const numOfRows = query.numOfRows ?? 200;

    if (depPlaceId === arrPlaceId) {
      throw new AppException(
        ErrorCode.INVALID_TRAIN_SEARCH_PARAMETER,
        '출발역과 도착역이 동일할 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.isValidDate(depPlandTime)) {
      throw new AppException(
        ErrorCode.INVALID_DEPARTURE_DATE,
        '출발 예정일 형식이 올바르지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const where: StationTimeWhereUnique = {
      depPlaceId,
      arrPlaceId,
      depPlandTime,
      pageNo,
      numOfRows,
    };

    // DB에서 조회
    const cached = await this.prisma.stationTime.findUnique({
      where: { depPlaceId_arrPlaceId_depPlandTime_pageNo_numOfRows: where },
    });
    if (cached) {
      return cached.data as unknown as TrainTimeResponseDto[];
    }

    // 캐시 미스: 외부 API 조회 후 저장
    return this.fetchAndStore(where, trainGradeCode);
  }

  /**
   * 캐시를 확인하지 않고 외부 API 에서 새로 조회해 DB(stations_times)에 저장한다.
   * 스케줄러의 사전 캐싱/갱신에서 사용한다. (항상 최신 데이터로 덮어씀)
   */
  async refreshTrainTimes(params: {
    depPlaceId: string;
    arrPlaceId: string;
    depPlandTime: string;
    pageNo?: number;
    numOfRows?: number;
    trainGradeCode?: string;
  }): Promise<TrainTimeResponseDto[]> {
    const where: StationTimeWhereUnique = {
      depPlaceId: params.depPlaceId,
      arrPlaceId: params.arrPlaceId,
      depPlandTime: params.depPlandTime,
      pageNo: params.pageNo ?? 1,
      numOfRows: params.numOfRows ?? 200,
    };
    return this.fetchAndStore(where, params.trainGradeCode);
  }

  /** 외부 API 호출 → 정규화 → upsert 저장. (getTrainTimes 미스 경로 / refreshTrainTimes 공용) */
  private async fetchAndStore(
    where: StationTimeWhereUnique,
    trainGradeCode?: string,
  ): Promise<TrainTimeResponseDto[]> {
    let data: unknown;
    try {
      data = await this.client.get(TRAIN_TIME_PATH, {
        ...where,
        ...(trainGradeCode ? { trainGradeCode } : {}),
      });
    } catch {
      throw new AppException(
        ErrorCode.EXTERNAL_TRAIN_API_ERROR,
        '열차 시간 조회 외부 API 호출에 실패했습니다.',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const result = this.normalize(data);

    // DB에 저장 (동시 요청 충돌 방지를 위해 upsert 사용)
    await this.prisma.stationTime.upsert({
      where: { depPlaceId_arrPlaceId_depPlandTime_pageNo_numOfRows: where },
      create: { ...where, data: result as unknown as Prisma.InputJsonValue },
      update: {
        data: result as unknown as Prisma.InputJsonValue,
        cachedAt: new Date(),
      },
    });

    return result;
  }

  /** 외부 응답을 프론트엔드 TrainTimeProps 형태로 정규화한다. */
  private normalize(data: unknown): TrainTimeResponseDto[] {
    const response = (data as { response?: unknown })?.response as
      | {
          header?: { resultCode?: string };
          body?: { items?: unknown };
        }
      | undefined;

    if (!response || !response.body) {
      throw new AppException(
        ErrorCode.EXTERNAL_TRAIN_API_ERROR,
        '열차 시간 외부 API 응답 형식이 올바르지 않습니다.',
        HttpStatus.BAD_GATEWAY,
      );
    }
    const resultCode = response.header?.resultCode;
    if (resultCode !== undefined && resultCode !== '00') {
      throw new AppException(
        ErrorCode.EXTERNAL_TRAIN_API_ERROR,
        '열차 시간 외부 API 오류 응답입니다.',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const rawItem = (response.body.items as { item?: unknown } | undefined)
      ?.item;
    if (!rawItem) return [];
    const list = Array.isArray(rawItem) ? rawItem : [rawItem];

    return list.map((it) => {
      const o = it as Record<string, unknown>;
      return {
        adultcharge: this.toNumber(o.adultcharge),
        arrplacename: this.toStr(o.arrplacename),
        arrplandtime: this.toNumber(o.arrplandtime),
        depplacename: this.toStr(o.depplacename),
        depplandtime: this.toNumber(o.depplandtime),
        traingradename: this.toStr(o.traingradename),
        trainno: this.toNumber(o.trainno),
      };
    });
  }

  private toNumber(v: unknown): number {
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }

  private toStr(v: unknown): string {
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    return '';
  }

  /** depPlandTime 의 앞 8자리(YYYYMMDD)가 실제 달력상 유효한 날짜인지 확인. */
  private isValidDate(depPlandTime: string): boolean {
    if (!/^\d{8,14}$/.test(depPlandTime)) return false;
    const year = Number(depPlandTime.slice(0, 4));
    const month = Number(depPlandTime.slice(4, 6));
    const day = Number(depPlandTime.slice(6, 8));
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;
    const d = new Date(Date.UTC(year, month - 1, day));
    return (
      d.getUTCFullYear() === year &&
      d.getUTCMonth() === month - 1 &&
      d.getUTCDate() === day
    );
  }
}
