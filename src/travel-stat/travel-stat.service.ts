// @role: features/travel-stat
// @rule: 목적지별 예매 통계 집계·조회만 담당
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/** 기존 프론트 useTravelStatic 의 StatItem 과 같은 모양 */
export interface TravelStatDto {
  destination: string;
  totalCount: number;
  byAge: Record<string, number>;
  byGender: Record<string, number>;
}

const GENDER_LABEL: Record<string, string> = { male: "남자", female: "여자" };

/** 화면의 나이대 칸(10대 ~ 60대+)에 맞춘다. users.age 는 숫자(예: 20)다. */
export function ageBucket(age: number | null): string | null {
  if (age === null || age < 0) return null;
  if (age >= 60) return "60대+";
  return `${Math.max(10, Math.floor(age / 10) * 10)}대`;
}

@Injectable()
export class TravelStatService {
  private readonly logger = new Logger(TravelStatService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 예매 1건을 목적지 통계에 더한다.
   *
   * 예매 트랜잭션 밖(커밋 뒤)에서 부른다. 통계 행은 같은 목적지를 고른 모든 예매가
   * 함께 쓰는 핫 로우라, 트랜잭션 안에 두면 같은 목적지 예매가 커밋까지 줄을 선다.
   * 기존 앱도 결제 뒤 별도 호출(saveStat)이었고, 실패해도 예매에는 영향이 없게 한다.
   * 증가는 INSERT ... ON DUPLICATE KEY UPDATE 한 문장이라 동시에 들어와도 유실되지 않는다.
   */
  async recordReservation(destination: string, userIdx: bigint): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { idx: userIdx },
        select: { age: true, gender: true },
      });
      await this.prisma.$executeRaw`
        INSERT INTO travel_stats (destination, totalCount) VALUES (${destination}, 1)
        ON DUPLICATE KEY UPDATE totalCount = totalCount + 1`;

      const buckets: [string, string][] = [];
      const age = ageBucket(user?.age ?? null);
      if (age) buckets.push(["age", age]);
      const gender = user?.gender ? GENDER_LABEL[user.gender] : undefined;
      if (gender) buckets.push(["gender", gender]);

      for (const [kind, bucket] of buckets) {
        await this.prisma.$executeRaw`
          INSERT INTO travel_stat_buckets (destination, kind, bucket, count)
          VALUES (${destination}, ${kind}, ${bucket}, 1)
          ON DUPLICATE KEY UPDATE count = count + 1`;
      }
    } catch (e) {
      this.logger.warn(`예매 통계 반영 실패 (${destination}): ${String(e)}`);
    }
  }

  /** 예매가 많은 목적지 순 */
  async list(): Promise<TravelStatDto[]> {
    const stats = await this.prisma.travelStat.findMany({
      orderBy: { totalCount: "desc" },
      include: { buckets: true },
    });
    return stats.map((s) => {
      const byAge: Record<string, number> = {};
      const byGender: Record<string, number> = {};
      for (const b of s.buckets) {
        (b.kind === "age" ? byAge : byGender)[b.bucket] = b.count;
      }
      return {
        destination: s.destination,
        totalCount: s.totalCount,
        byAge,
        byGender,
      };
    });
  }
}
