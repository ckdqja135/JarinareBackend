// @role: features/comment
// @rule: 댓글 생성·수정·삭제, 본인 또는 admin만 수정·삭제 가능
import { ForbiddenException, HttpStatus, Injectable } from "@nestjs/common";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { NotificationService } from "../notification/notification.service";
import {
  CreateCommentDto,
  UpdateCommentDto,
  DeleteCommentDto,
  ToggleCommentLikeDto,
} from "./dto/comment-request.dto";

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateCommentDto, user: AuthUser): Promise<{ id: number }> {
    const comment = await this.prisma.comment.create({
      data: {
        boardId: BigInt(dto.boardId),
        authorIdx: BigInt(user.idx),
        content: dto.content,
        parentId: dto.parentId != null ? BigInt(dto.parentId) : null,
      },
    });

    await this.sendCommentNotification(dto, user, comment.id);

    return { id: Number(comment.id) };
  }

  private async sendCommentNotification(
    dto: CreateCommentDto,
    user: AuthUser,
    _commentId: bigint,
  ): Promise<void> {
    const [board, commenter] = await Promise.all([
      this.prisma.board.findUnique({
        where: { id: BigInt(dto.boardId) },
        select: { authorIdx: true, title: true, type: true },
      }),
      this.prisma.user.findUnique({
        where: { idx: BigInt(user.idx) },
        select: { name: true },
      }),
    ]);
    if (!board || !commenter) return;

    const commenterName = commenter.name;

    if (dto.parentId != null) {
      // 대댓글: 원댓글 작성자에게 reply 알림
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: BigInt(dto.parentId) },
        select: { authorIdx: true },
      });
      if (parentComment && parentComment.authorIdx !== BigInt(user.idx)) {
        await this.notificationService.create(
          parentComment.authorIdx,
          "reply",
          {
            commenterName,
            boardId: dto.boardId,
            boardType: board.type,
            boardTitle: board.title,
            commentContent: dto.content.slice(0, 50),
          },
        );
      }
    } else {
      // 댓글: 게시물 작성자에게 comment 알림
      if (board.authorIdx !== BigInt(user.idx)) {
        await this.notificationService.create(board.authorIdx, "comment", {
          commenterName,
          boardId: dto.boardId,
          boardType: board.type,
          boardTitle: board.title,
          commentContent: dto.content.slice(0, 50),
        });
      }
    }
  }

  async update(dto: UpdateCommentDto, user: AuthUser): Promise<{ message: string }> {
    const comment = await this.prisma.comment.findFirst({
      where: { id: BigInt(dto.id) },
    });

    if (!comment) {
      throw new AppException(
        ErrorCode.COMMENT_NOT_FOUND,
        "댓글을 찾을 수 없습니다.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (comment.authorIdx !== BigInt(user.idx) && user.role !== "admin") {
      throw new ForbiddenException("본인이 작성한 댓글만 수정할 수 있습니다.");
    }

    await this.prisma.comment.update({
      where: { id: BigInt(dto.id) },
      data: { content: dto.content },
    });

    return { message: "수정되었습니다." };
  }

  async remove(dto: DeleteCommentDto, user: AuthUser): Promise<{ message: string }> {
    const comment = await this.prisma.comment.findFirst({
      where: { id: BigInt(dto.id) },
    });

    if (!comment) {
      throw new AppException(
        ErrorCode.COMMENT_NOT_FOUND,
        "댓글을 찾을 수 없습니다.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (comment.authorIdx !== BigInt(user.idx) && user.role !== "admin") {
      throw new ForbiddenException("본인이 작성한 댓글만 삭제할 수 있습니다.");
    }

    // 하위 댓글(대댓글) 먼저 삭제
    await this.prisma.comment.deleteMany({
      where: { parentId: BigInt(dto.id) },
    });

    await this.prisma.comment.delete({
      where: { id: BigInt(dto.id) },
    });

    return { message: "삭제되었습니다." };
  }

  async toggleLike(
    dto: ToggleCommentLikeDto,
    user: AuthUser,
  ): Promise<{ liked: number; isLiked: boolean }> {
    const existing = await this.prisma.commentLike.findUnique({
      where: {
        commentId_userIdx: {
          commentId: BigInt(dto.commentId),
          userIdx: BigInt(user.idx),
        },
      },
    });

    if (existing) {
      // 좋아요 취소
      await this.prisma.$transaction([
        this.prisma.commentLike.delete({
          where: {
            commentId_userIdx: {
              commentId: BigInt(dto.commentId),
              userIdx: BigInt(user.idx),
            },
          },
        }),
        this.prisma.comment.update({
          where: { id: BigInt(dto.commentId) },
          data: { liked: { decrement: 1 } },
        }),
      ]);
      const comment = await this.prisma.comment.findUnique({
        where: { id: BigInt(dto.commentId) },
      });
      return { liked: Number(comment?.liked ?? 0), isLiked: false };
    } else {
      // 좋아요
      await this.prisma.$transaction([
        this.prisma.commentLike.create({
          data: {
            commentId: BigInt(dto.commentId),
            userIdx: BigInt(user.idx),
          },
        }),
        this.prisma.comment.update({
          where: { id: BigInt(dto.commentId) },
          data: { liked: { increment: 1 } },
        }),
      ]);
      const comment = await this.prisma.comment.findUnique({
        where: { id: BigInt(dto.commentId) },
        include: { board: { select: { id: true, type: true, title: true } } },
      });

      // 본인 댓글이 아닐 때만 알림
      if (comment && comment.authorIdx !== BigInt(user.idx)) {
        try {
          const liker = await this.prisma.user.findUnique({
            where: { idx: BigInt(user.idx) },
            select: { name: true },
          });
          await this.notificationService.create(comment.authorIdx, "comment_like", {
            likerName: liker?.name ?? "",
            boardId: Number(comment.board.id),
            boardType: comment.board.type,
            boardTitle: comment.board.title,
            commentContent: comment.content.slice(0, 50),
          });
        } catch {
          // 알림 실패는 무시
        }
      }

      return { liked: Number(comment?.liked ?? 0), isLiked: true };
    }
  }

  async getLikedCommentIds(boardId: number, user: AuthUser): Promise<number[]> {
    const likes = await this.prisma.commentLike.findMany({
      where: {
        userIdx: BigInt(user.idx),
        comment: { boardId: BigInt(boardId) },
      },
      select: { commentId: true },
    });
    return likes.map((l) => Number(l.commentId));
  }
}
