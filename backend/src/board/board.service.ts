// @role: features/board
// @rule: notice/event 생성은 admin 전용
import { existsSync, unlinkSync } from "fs";
import { basename, join } from "path";
import { ForbiddenException, HttpStatus, Injectable } from "@nestjs/common";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { Prisma } from "../generated/prisma/client";
import {
  BoardDetailQueryDto,
  BoardListQueryDto,
  BoardType,
} from "./dto/board-query.dto";
import { CreateBoardDto, UpdateBoardDto, DeleteBoardDto, ToggleBoardLikeDto } from "./dto/board-request.dto";
import { NotificationService } from "../notification/notification.service";
import { shouldNotify } from "../notification/notification.types";
import type {
  BoardDetailDto,
  BoardDetailFreeDto,
  BoardDetailNoticeDto,
  BoardDetailEventDto,
  BoardDetailReviewDto,
  BoardListResponseDto,
  CreateBoardResponseDto,
  MessageResponseDto,
} from "./dto/board-response.dto";

/**
 * 인기 게시글/댓글에 좋아요가 몰리면 같은 행의 X 락을 두고 줄을 선다.
 * 기본 maxWait(2초)로는 줄이 길어질 때 트랜잭션을 시작조차 못 해 500 이 난다.
 * 좋아요가 조금 느려지는 편이 실패해서 사라지는 것보다 낫다.
 */
const LIKE_TX_OPTIONS = { maxWait: 10_000, timeout: 15_000 };

@Injectable()
export class BoardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getList(query: BoardListQueryDto): Promise<BoardListResponseDto> {
    const page = query.page ?? 1;
    const size = query.size ?? 8;
    const skip = (page - 1) * size;

    const where: Prisma.BoardWhereInput = {
      type: query.type,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search } },
              { content: { contains: query.search } },
            ],
          }
        : {}),
    };

    const orderBy = this.resolveOrderBy(query.sort);

    const [total, boards] = await Promise.all([
      this.prisma.board.count({ where }),
      this.prisma.board.findMany({
        where,
        orderBy,
        skip,
        take: size,
        include: {
          author: { select: { name: true } },
          _count: { select: { comments: true } },
        },
      }),
    ]);

    return {
      items: boards.map((b) => ({
        id: Number(b.id),
        title: b.title,
        author: b.author.name,
        createdAt: b.createdAt.toISOString(),
        imageUrl: b.imageUrl ?? null,
        commentCount: b._count.comments,
        tags: (b.tags as string[]) ?? [],
        liked: Number(b.liked),
      })),
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async getDetail(
    id: number,
    query: BoardDetailQueryDto,
  ): Promise<BoardDetailDto> {
    const board = await this.prisma.board.findFirst({
      where: { id: BigInt(id), type: query.type },
      include: {
        author: { select: { name: true } },
        comments:
          query.type === BoardType.FREE
            ? {
                include: { author: { select: { name: true } } },
                orderBy: { createdAt: "asc" },
              }
            : false,
      },
    });

    if (!board) {
      throw new AppException(
        ErrorCode.POST_NOT_FOUND,
        "게시물을 찾을 수 없습니다.",
        HttpStatus.NOT_FOUND,
      );
    }

    const base = {
      id: Number(board.id),
      title: board.title,
      content: board.content,
      author: board.author.name,
      createdAt: board.createdAt.toISOString(),
      imageUrl: board.imageUrl ?? null,
    };

    switch (query.type) {
      case BoardType.FREE: {
        const comments = (
          board.comments as unknown as Array<{
            id: bigint;
            author: { name: string };
            content: string;
            createdAt: Date;
            parentId: bigint | null;
            liked: bigint;
          }>
        ).map((c) => ({
          id: Number(c.id),
          author: c.author.name,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          parentId: c.parentId !== null ? Number(c.parentId) : null,
          liked: Number(c.liked),
        }));
        return { ...base, tags: (board.tags as string[]) ?? [], comments } as BoardDetailFreeDto;
      }
      case BoardType.NOTICE:
        return base as BoardDetailNoticeDto;
      case BoardType.EVENT:
        return base as BoardDetailEventDto;
      case BoardType.REVIEW:
        return {
          ...base,
          rating: board.rating ? Number(board.rating) : 0,
          tags: (board.tags as string[]) ?? [],
        } as BoardDetailReviewDto;
    }
  }

  async create(
    dto: CreateBoardDto,
    user: AuthUser,
  ): Promise<CreateBoardResponseDto> {
    if (
      (dto.type === BoardType.NOTICE || dto.type === BoardType.EVENT) &&
      user.role !== "admin"
    ) {
      throw new ForbiddenException("공지사항/이벤트는 관리자만 작성할 수 있습니다.");
    }

    const board = await this.prisma.board.create({
      data: {
        type: dto.type,
        title: dto.title,
        content: dto.content,
        authorIdx: BigInt(user.idx),
        imageUrl: dto.imageUrl ?? null,
        tags: dto.tags
          ? (dto.tags as unknown as Prisma.InputJsonValue)
          : Prisma.DbNull,
        rating: dto.rating ?? null,
      },
    });

    return { id: Number(board.id) };
  }

  async update(
    id: number,
    dto: UpdateBoardDto,
    user: AuthUser,
  ): Promise<MessageResponseDto> {
    const board = await this.prisma.board.findFirst({
      where: { id: BigInt(id), type: dto.type },
    });

    if (!board) {
      throw new AppException(
        ErrorCode.POST_NOT_FOUND,
        "게시물을 찾을 수 없습니다.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (board.authorIdx !== BigInt(user.idx) && user.role !== "admin") {
      throw new ForbiddenException("본인이 작성한 게시물만 수정할 수 있습니다.");
    }

    // imageUrl이 바뀌면 기존 파일 삭제
    if (dto.imageUrl !== undefined && board.imageUrl !== dto.imageUrl) {
      this.deleteImageFile(board.imageUrl);
    }

    await this.prisma.board.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.tags !== undefined && {
          tags: dto.tags as unknown as Prisma.InputJsonValue,
        }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
      },
    });

    return { message: "수정되었습니다." };
  }

  async remove(
    id: number,
    dto: DeleteBoardDto,
    user: AuthUser,
  ): Promise<MessageResponseDto> {
    const board = await this.prisma.board.findFirst({
      where: { id: BigInt(id), type: dto.type },
    });

    if (!board) {
      throw new AppException(
        ErrorCode.POST_NOT_FOUND,
        "게시물을 찾을 수 없습니다.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (board.authorIdx !== BigInt(user.idx) && user.role !== "admin") {
      throw new ForbiddenException("본인이 작성한 게시물만 삭제할 수 있습니다.");
    }

    this.deleteImageFile(board.imageUrl);
    await this.prisma.board.delete({ where: { id: BigInt(id) } });

    return { message: "삭제되었습니다." };
  }

  async toggleLike(
    dto: ToggleBoardLikeDto,
    user: AuthUser,
  ): Promise<{ liked: number; isLiked: boolean }> {
    const board = await this.prisma.board.findUnique({
      where: { id: BigInt(dto.boardId) },
      // author 는 알림 수신자 — 수신 설정을 여기서 같이 읽어 왕복을 늘리지 않는다.
      include: {
        author: {
          select: { name: true, notifiChange: true, notifResponse: true },
        },
      },
    });

    if (!board) {
      throw new AppException(
        ErrorCode.POST_NOT_FOUND,
        "게시물을 찾을 수 없습니다.",
        HttpStatus.NOT_FOUND,
      );
    }

    const existing = await this.prisma.boardLike.findUnique({
      where: {
        boardId_userIdx: {
          boardId: BigInt(dto.boardId),
          userIdx: BigInt(user.idx),
        },
      },
    });

    if (existing) {
      // 좋아요와 같은 이유로 부모 행을 먼저 잡는다.
      await this.prisma.$transaction([
        this.prisma.board.update({
          where: { id: BigInt(dto.boardId) },
          data: { liked: { decrement: 1 } },
        }),
        this.prisma.boardLike.delete({
          where: {
            boardId_userIdx: {
              boardId: BigInt(dto.boardId),
              userIdx: BigInt(user.idx),
            },
          },
        }),
      ]);
      const updated = await this.prisma.board.findUnique({
        where: { id: BigInt(dto.boardId) },
      });
      return { liked: Number(updated?.liked ?? 0), isLiked: false };
    } else {
      // 본인 게시물이 아니고 수신 설정이 켜져 있을 때만 알림
      const notifyAuthor =
        board.authorIdx !== BigInt(user.idx) &&
        shouldNotify("board_like", board.author);

      const liker = notifyAuthor
        ? await this.prisma.user.findUnique({
            where: { idx: BigInt(user.idx) },
            select: { name: true },
          })
        : null;

      const result = await this.prisma.$transaction(async (tx) => {
        // 부모 행(카운터)을 먼저 X 락으로 잡는다.
        // 자식 INSERT/DELETE 는 FK 때문에 부모 행에 S 락을 걸므로, 자식을 먼저
        // 처리하면 모든 트랜잭션이 'S 보유 → X 대기' 가 되어 서로 물린다(데드락).
        const updated = await tx.board.update({
          where: { id: BigInt(dto.boardId) },
          data: { liked: { increment: 1 } },
          select: { liked: true },
        });
        await tx.boardLike.create({
          data: {
            boardId: BigInt(dto.boardId),
            userIdx: BigInt(user.idx),
          },
        });

        // 좋아요와 같은 트랜잭션에 알림을 남긴다.
        // 좋아요는 됐는데 알림만 유실되는 상황이 원천적으로 생기지 않는다.
        const notification = notifyAuthor
          ? await this.notificationService.createInTx(
              tx,
              board.authorIdx,
              "board_like",
              {
                likerName: liker?.name ?? "",
                boardId: dto.boardId,
                boardType: board.type,
                boardTitle: board.title,
              },
            )
          : null;

        return { liked: updated.liked, notification };
      }, LIKE_TX_OPTIONS);

      // 반드시 커밋 뒤에 — 롤백된 알림을 보내지 않기 위해.
      this.notificationService.deliver(result.notification);

      return { liked: Number(result.liked), isLiked: true };
    }
  }

  async getLikedBoardIds(user: AuthUser): Promise<number[]> {
    const likes = await this.prisma.boardLike.findMany({
      where: { userIdx: BigInt(user.idx) },
      select: { boardId: true },
    });
    return likes.map((l) => Number(l.boardId));
  }

  private resolveOrderBy(
    sort: "asc" | "desc" = "desc",
  ): Prisma.BoardOrderByWithRelationInput {
    return { createdAt: sort };
  }

  private deleteImageFile(imageUrl: string | null | undefined): void {
    if (!imageUrl?.startsWith("/uploads/board/")) return;
    const filePath = join(process.cwd(), "uploads", "board", basename(imageUrl));
    if (existsSync(filePath)) unlinkSync(filePath);
  }
}
