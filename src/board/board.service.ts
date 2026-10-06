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
      include: { author: { select: { name: true } } },
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
      await this.prisma.$transaction([
        this.prisma.boardLike.delete({
          where: {
            boardId_userIdx: {
              boardId: BigInt(dto.boardId),
              userIdx: BigInt(user.idx),
            },
          },
        }),
        this.prisma.board.update({
          where: { id: BigInt(dto.boardId) },
          data: { liked: { decrement: 1 } },
        }),
      ]);
      const updated = await this.prisma.board.findUnique({
        where: { id: BigInt(dto.boardId) },
      });
      return { liked: Number(updated?.liked ?? 0), isLiked: false };
    } else {
      await this.prisma.$transaction([
        this.prisma.boardLike.create({
          data: {
            boardId: BigInt(dto.boardId),
            userIdx: BigInt(user.idx),
          },
        }),
        this.prisma.board.update({
          where: { id: BigInt(dto.boardId) },
          data: { liked: { increment: 1 } },
        }),
      ]);
      const updated = await this.prisma.board.findUnique({
        where: { id: BigInt(dto.boardId) },
      });

      // 본인 게시물이 아닐 때만 알림
      if (board.authorIdx !== BigInt(user.idx)) {
        const liker = await this.prisma.user.findUnique({
          where: { idx: BigInt(user.idx) },
          select: { name: true },
        });
        await this.notificationService.create(board.authorIdx, "board_like", {
          likerName: liker?.name ?? "",
          boardId: dto.boardId,
          boardType: board.type,
          boardTitle: board.title,
        });
      }

      return { liked: Number(updated?.liked ?? 0), isLiked: true };
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
