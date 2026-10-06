// @role: entities/dto
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from "class-validator";
import { MAX_SEATS_PER_ORDER } from "../seat.constants";

/** "A1" ~ "Z99" — 배치도에 실제로 있는 좌석인지는 서비스가 다시 확인한다 */
const SEAT_ID = /^[A-Z][1-9][0-9]?$/;
/** 공공데이터 열차 API 의 depplandtime 형식 (YYYYMMDDHHmm) */
const PLAND_TIME = /^\d{12}$/;

export class SeatLayoutQueryDto {
  @ApiProperty({
    description: "열차 종류 코드 (예: 00 = KTX). 전용 배치가 없으면 기본 배치",
  })
  @IsString()
  @Length(1, 20)
  trainType!: string;

  @ApiPropertyOptional({ description: "호차 번호. 없으면 전체 호차" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  carNo?: number;
}

export class UpsertTripDto {
  @ApiProperty({ example: "101" })
  @IsString()
  @Length(1, 20)
  trainNo!: string;

  @ApiProperty({ example: "00" })
  @IsString()
  @Length(1, 20)
  trainType!: string;

  @ApiProperty({ example: "NAT010000" })
  @IsString()
  @Length(1, 40)
  depPlaceId!: string;

  @ApiProperty({ example: "NAT014445" })
  @IsString()
  @Length(1, 40)
  arrPlaceId!: string;

  @ApiProperty({ example: "202610050900" })
  @Matches(PLAND_TIME, {
    message: "depPlandTime 은 YYYYMMDDHHmm 형식이어야 합니다.",
  })
  depPlandTime!: string;

  @ApiProperty({ example: "202610051130" })
  @Matches(PLAND_TIME, {
    message: "arrPlandTime 은 YYYYMMDDHHmm 형식이어야 합니다.",
  })
  arrPlandTime!: string;

  @ApiProperty({ example: "서울" })
  @IsString()
  @Length(1, 100)
  depName!: string;

  @ApiProperty({ example: "부산" })
  @IsString()
  @Length(1, 100)
  arrName!: string;
}

export class SeatSelectionDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  tripId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  carNo!: number;

  @ApiProperty({ example: ["A1", "B1"] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_SEATS_PER_ORDER)
  @ArrayUnique()
  @Matches(SEAT_ID, {
    each: true,
    message: "좌석 번호 형식이 올바르지 않습니다.",
  })
  seatIds!: string[];
}

export class ReleaseHoldDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  tripId!: number;

  @ApiPropertyOptional({
    description: "없으면 이 운행편의 내 선점을 전부 해제",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  carNo?: number;

  @ApiPropertyOptional({ example: ["A1"] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_SEATS_PER_ORDER)
  @Matches(SEAT_ID, {
    each: true,
    message: "좌석 번호 형식이 올바르지 않습니다.",
  })
  seatIds?: string[];
}

/**
 * 예매 확정. 기존 프론트의 selectAdult / selectKid / selectPay 를 그대로 받는다.
 * 성인 + 아동 수는 좌석 수와 같아야 한다.
 */
export class CreateReservationDto extends SeatSelectionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  @Max(MAX_SEATS_PER_ORDER)
  adult!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  @Max(MAX_SEATS_PER_ORDER)
  kid!: number;

  @ApiProperty({
    example: 98000,
    description:
      "결제 최종 금액 (기존 finalPrice). 좌석별로 나눠 저장하되 합계는 그대로 보존",
  })
  @IsInt()
  @Min(0)
  totalPrice!: number;

  // ── 아래는 기존 결제 화면(usePayModal)이 계산해 Firestore 에 따로 쓰던 값 ──

  @ApiPropertyOptional({ example: 1000, description: "사용한 포인트" })
  @IsOptional()
  @IsInt()
  @Min(0)
  usedPoint?: number;

  @ApiPropertyOptional({
    example: 980,
    description: "카드 페이백으로 적립할 포인트",
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  paybackPoint?: number;

  @ApiPropertyOptional({ example: "신용카드", description: "결제 수단" })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  paymentMethod?: string;

  @ApiPropertyOptional({ example: "현대", description: "신용카드 이름" })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  selectedCard?: string | null;

  @ApiPropertyOptional({
    example: "10월 10일 (토)",
    description: "결제 내역에 그대로 보여 줄 출발일 표기",
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  startDayForView?: string;
}

export class CancelReservationDto {
  @ApiProperty({ example: [1, 2] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_SEATS_PER_ORDER)
  @ArrayUnique()
  @IsInt({ each: true })
  reservationIds!: number[];
}

/**
 * 좌석 변경 신청. 기존 앱처럼 함께 예매한 일행 좌석은 같이 움직인다.
 * 고른 좌석이 전부 비어 있으면 즉시 이동, 남의 일행 좌석이 섞여 있으면 그 사람에게 교환 신청.
 */
export class CreateChangeRequestDto {
  @ApiProperty({
    description: "옮길 내 예약들 (보통 함께 예매한 일행 좌석 전부)",
    example: [1, 2],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_SEATS_PER_ORDER)
  @ArrayUnique()
  @IsInt({ each: true })
  reservationIds!: number[];

  @ApiProperty({
    description: "옮겨 갈 호차 (지금 호차와 달라도 된다)",
    example: 2,
  })
  @IsInt()
  @Min(1)
  toCarNo!: number;

  @ApiProperty({
    description: "옮겨 갈 좌석. 내 좌석 수와 같아야 한다",
    example: ["C3", "D3"],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_SEATS_PER_ORDER)
  @ArrayUnique()
  @Matches(SEAT_ID, {
    each: true,
    message: "좌석 번호 형식이 올바르지 않습니다.",
  })
  toSeatIds!: string[];
}

export class ChangeRequestListQueryDto {
  @ApiProperty({ enum: ["received", "sent"] })
  @IsIn(["received", "sent"])
  box!: "received" | "sent";
}
