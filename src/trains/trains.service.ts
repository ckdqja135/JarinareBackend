import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-code';
import { PublicDataClient } from '../external/public-data.client';
import { TrainTimeQueryDto } from './dto/train-time-query.dto';
import { TrainTimeResponseDto } from './dto/train-time-response.dto';

interface CacheEntry {
  value: TrainTimeResponseDto[];
  expiresAt: number;
}

const TRAIN_TIME_PATH = '/GetStrtpntAlocFndTrainInfo';

@Injectable()
export class TrainsService {
  private readonly logger = new Logger(TrainsService.name);
  // 인스턴스 로컬 단기 캐시. (다중 인스턴스에서는 Redis 로 교체 가능)
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    private readonly client: PublicDataClient,
    private readonly config: AppConfigService,
  ) {}

  /**
   * 열차 시간 조회. 외부 API 를 프록시하며 serviceKey 는 서버에서만 주입한다.
   *  - 필수/형식 검증, 출발=도착 검증
   *  - 단일 객체/배열 응답 정규화, 숫자 문자열 → number 변환
   *  - 동일 조건 반복 요청에 짧은 캐시 적용
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

    const cacheKey = [
      depPlaceId,
      arrPlaceId,
      depPlandTime,
      trainGradeCode ?? '',
      pageNo,
      numOfRows,
    ].join('|');

    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    let data: unknown;
    try {
      data = await this.client.get(TRAIN_TIME_PATH, {
        depPlaceId,
        arrPlaceId,
        depPlandTime,
        pageNo,
        numOfRows,
        ...(trainGradeCode ? { trainGradeCode } : {}),
      });
    } catch {
      // 외부 API 원본 오류/서비스키는 노출하지 않고 표준 오류로 변환한다.
      throw new AppException(
        ErrorCode.EXTERNAL_TRAIN_API_ERROR,
        '열차 시간 조회 외부 API 호출에 실패했습니다.',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const result = this.normalize(data);
    this.setCached(cacheKey, result);
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
    if (!rawItem) return []; // 결과 없음 → 빈 배열
    const list = Array.isArray(rawItem) ? rawItem : [rawItem];

    // 프론트엔드에서 사용하지 않는 필드는 제거하고 필요한 필드만 매핑한다.
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

  private getCached(key: string): TrainTimeResponseDto[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  private setCached(key: string, value: TrainTimeResponseDto[]): void {
    const ttlMs = this.config.trainTimeCacheTtlSeconds * 1000;
    if (ttlMs <= 0) return;
    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}
