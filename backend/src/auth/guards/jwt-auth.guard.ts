import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { AuthUser } from "../interfaces/auth-user.interface";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException("인증 토큰이 없습니다.");

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
        role: string;
      }>(token);
      request.user = {
        idx: payload.sub,
        email: payload.email,
        role: payload.role === "admin" ? "admin" : "user",
      };
      return true;
    } catch {
      throw new UnauthorizedException("유효하지 않거나 만료된 토큰입니다.");
    }
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(" ");
      return type === "Bearer" ? token : undefined;
    }
    // SSE는 EventSource가 커스텀 헤더를 지원하지 않으므로 쿼리 파라미터로 fallback
    const queryToken = (request.query as Record<string, string>)?.token;
    return typeof queryToken === "string" ? queryToken : undefined;
  }
}
