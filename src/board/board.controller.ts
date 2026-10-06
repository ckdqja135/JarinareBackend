// @role: widgets/controller
// @rule: GET 목록·상세는 Public, 생성·수정·삭제는 JWT 필요
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { BoardService } from "./board.service";
import {
  BoardDetailQueryDto,
  BoardListQueryDto,
} from "./dto/board-query.dto";
import { CreateBoardDto, UpdateBoardDto, DeleteBoardDto, ToggleBoardLikeDto } from "./dto/board-request.dto";

@ApiTags("board")
@Controller("board")
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "게시물 목록 조회" })
  getList(@Query() query: BoardListQueryDto) {
    return this.boardService.getList(query);
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "게시물 상세 조회" })
  getDetail(
    @Param("id", ParseIntPipe) id: number,
    @Query() query: BoardDetailQueryDto,
  ) {
    return this.boardService.getDetail(id, query);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: "게시물 생성" })
  create(@Body() dto: CreateBoardDto, @CurrentUser() user: AuthUser) {
    return this.boardService.create(dto, user);
  }

  @ApiBearerAuth()
  @Put()
  @ApiOperation({ summary: "게시물 수정" })
  update(
    @Body() dto: UpdateBoardDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.boardService.update(dto.id, dto, user);
  }

  @ApiBearerAuth()
  @Delete()
  @ApiOperation({ summary: "게시물 삭제" })
  remove(
    @Body() dto: DeleteBoardDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.boardService.remove(dto.id, dto, user);
  }

  @ApiBearerAuth()
  @Post("like")
  @ApiOperation({ summary: "게시물 좋아요 토글" })
  toggleLike(@Body() dto: ToggleBoardLikeDto, @CurrentUser() user: AuthUser) {
    return this.boardService.toggleLike(dto, user);
  }

  @ApiBearerAuth()
  @Get("like/me")
  @ApiOperation({ summary: "내가 좋아요한 게시물 ID 목록" })
  getLikedBoardIds(@CurrentUser() user: AuthUser) {
    return this.boardService.getLikedBoardIds(user);
  }
}
