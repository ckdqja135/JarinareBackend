// @role: widgets/controller
// @rule: 생성·수정·삭제 모두 JWT 필요
import { Body, Controller, Delete, Get, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { CommentService } from "./comment.service";
import {
  CreateCommentDto,
  UpdateCommentDto,
  DeleteCommentDto,
  ToggleCommentLikeDto,
} from "./dto/comment-request.dto";

@ApiTags("comment")
@ApiBearerAuth()
@Controller("comment")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: "댓글 생성" })
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: AuthUser) {
    return this.commentService.create(dto, user);
  }

  @Put()
  @ApiOperation({ summary: "댓글 수정" })
  update(@Body() dto: UpdateCommentDto, @CurrentUser() user: AuthUser) {
    return this.commentService.update(dto, user);
  }

  @Delete()
  @ApiOperation({ summary: "댓글 삭제" })
  remove(@Body() dto: DeleteCommentDto, @CurrentUser() user: AuthUser) {
    return this.commentService.remove(dto, user);
  }

  @Post("like")
  @ApiOperation({ summary: "댓글 좋아요 토글" })
  toggleLike(@Body() dto: ToggleCommentLikeDto, @CurrentUser() user: AuthUser) {
    return this.commentService.toggleLike(dto, user);
  }

  @Get("like/me")
  @ApiOperation({ summary: "내가 좋아요한 댓글 ID 목록" })
  getLikedCommentIds(@Query("boardId") boardId: string, @CurrentUser() user: AuthUser) {
    return this.commentService.getLikedCommentIds(Number(boardId), user);
  }
}
