// @role: features/comment
// @rule: 댓글 생성·수정·삭제, 본인 또는 admin만 수정·삭제 가능
import { ForbiddenException, HttpStatus, Injectable } from "@nestjs/common";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { NotificationService } from "../notification/notification.service";
import {
  shouldNotify,
  type NotificationType,
} from "../notification/notification.types";
import {
  CreateCommentDto,
  UpdateCommentDto,
  DeleteCommentDto,
  ToggleCommentLikeDto,
} from "./dto/comment-request.dto";

/**
 * 인기 게시글/댓글에 좋아요가 몰리면 같은 행의 X 락을 두고 줄을 선다.
 * 기본 maxWait(2초)로는 줄이 길어질 때 트랜잭션을 시작조차 못 해 500 이 난다.
 * 좋아요가 조금 느려지는 편이 실패해서 사라지는 것보다 낫다.
 */
const LIKE_TX_OPTIONS = { maxWait: 10_000, timeout: 15_000 };

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateCommentDto, user: AuthUser): Promise<{ id: number }> {
    // 알림 수신자·페이로드는 트랜잭션 밖에서 미리 정해 둔다 (트랜잭션을 짧게 유지).
    const target = await this.resolveCommentNotification(dto, user);

    const result = await this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          boardId: BigInt(dto.boardId),
          authorIdx: BigInt(user.idx),
          content: dto.content,
          parentId: dto.parentId != null ? BigInt(dto.parentId) : null,
        },
      });

      // 댓글과 같은 트랜잭션에 알림을 남긴다.
      const notification = target
        ? await this.notificationService.createInTx(
            tx,
            target.userIdx,
            target.type,
            target.payload,
          )
        : null;

      return { comment, notification };
    });

    // 반드시 커밋 뒤에 — 롤백된 알림을 보내지 않기 위해.
    this.notificationService.deliver(result.notification);

    return { id: Number(result.comment.id) };
  }

  /** 댓글 알림을 누구에게 어떤 내용으로 보낼지 결정한다. 보낼 대상이 없으면 null. */
  private async resolveCommentNotification(
    dto: CreateCommentDto,
    user: AuthUser,
  ): Promise<{
    userIdx: bigint;
    type: NotificationType;
    payload: object;
  } | null> {
    const [board, commenter] = await Promise.all([
      this.prisma.board.findUnique({
        where: { id: BigInt(dto.boardId) },
        select: {
          authorIdx: true,
          title: true,
          type: true,
          // 알림 수신자의 설정을 같이 읽어 왕복을 늘리지 않는다.
          author: { select: { notifiChange: true, notifResponse: true } },
        },
      }),
      this.prisma.user.findUnique({
        where: { idx: BigInt(user.idx) },
        select: { name: true },
      }),
    ]);
    if (!board || !commenter) return null;

    const payload = {
      commenterName: commenter.name,
      boardId: dto.boardId,
      boardType: board.type,
      boardTitle: board.title,
      commentContent: dto.content.slice(0, 50),
    };

    // 대댓글: 원댓글 작성자에게 reply 알림
    if (dto.parentId != null) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: BigInt(dto.parentId) },
        select: {
          authorIdx: true,
          author: { select: { notifiChange: true, notifResponse: true } },
        },
      });
      if (!parent || parent.authorIdx === BigInt(user.idx)) return null;
      if (!shouldNotify("reply", parent.author)) return null;
      return { userIdx: parent.authorIdx, type: "reply", payload };
    }

    // 댓글: 게시물 작성자에게 comment 알림
    if (board.authorIdx === BigInt(user.idx)) return null;
    if (!shouldNotify("comment", board.author)) return null;
    return { userIdx: board.authorIdx, type: "comment", payload };
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
      // 좋아요와 같은 이유로 부모 행을 먼저 잡는다.
      await this.prisma.$transaction([
        this.prisma.comment.update({
          where: { id: BigInt(dto.commentId) },
          data: { liked: { decrement: 1 } },
        }),
        this.prisma.commentLike.delete({
          where: {
            commentId_userIdx: {
              commentId: BigInt(dto.commentId),
              userIdx: BigInt(user.idx),
            },
          },
        }),
      ]);
      const comment = await this.prisma.comment.findUnique({
        where: { id: BigInt(dto.commentId) },
      });
      return { liked: Number(comment?.liked ?? 0), isLiked: false };
    } else {
      // 좋아요
      const comment = await this.prisma.comment.findUnique({
        where: { id: BigInt(dto.commentId) },
        select: {
          authorIdx: true,
          content: true,
          // 알림 수신자의 설정을 같이 읽어 왕복을 늘리지 않는다.
          author: { select: { notifiChange: true, notifResponse: true } },
          board: { select: { id: true, type: true, title: true } },
        },
      });

      if (!comment) {
        throw new AppException(
          ErrorCode.COMMENT_NOT_FOUND,
          "댓글을 찾을 수 없습니다.",
          HttpStatus.NOT_FOUND,
        );
      }

      // 본인 댓글이 아니고 수신 설정이 켜져 있을 때만 알림
      const notifyAuthor =
        comment.authorIdx !== BigInt(user.idx) &&
        shouldNotify("comment_like", comment.author);

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
        const updated = await tx.comment.update({
          where: { id: BigInt(dto.commentId) },
          data: { liked: { increment: 1 } },
          select: { liked: true },
        });
        await tx.commentLike.create({
          data: {
            commentId: BigInt(dto.commentId),
            userIdx: BigInt(user.idx),
          },
        });

        // 좋아요와 같은 트랜잭션에 알림을 남긴다.
        const notification = notifyAuthor
          ? await this.notificationService.createInTx(
              tx,
              comment.authorIdx,
              "comment_like",
              {
                likerName: liker?.name ?? "",
                boardId: Number(comment.board.id),
                boardType: comment.board.type,
                boardTitle: comment.board.title,
                commentContent: comment.content.slice(0, 50),
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
