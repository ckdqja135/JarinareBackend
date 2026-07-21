import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { FirebaseService } from '../../firebase/firebase.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUser, UserRole } from '../interfaces/auth-user.interface';

/**
 * Authorization: Bearer <firebaseIdToken> 헤더의 Firebase ID 토큰을 Admin SDK 로 검증하는 가드.
 * 검증에 성공하면 request.user 에 { uid, email, name, role } 을 주입한다.
 * @Public() 라우트는 검증을 건너뛴다.
 *
 * 권한(role)은 Firebase Custom Claims 의 role 클레임을 사용한다. (없으면 'user')
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly firebase: FirebaseService,
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
    if (!token) {
      throw new UnauthorizedException('인증 토큰이 없습니다.');
    }

    try {
      const decoded = await this.firebase.verifyIdToken(token);
      const role: UserRole = decoded.role === 'admin' ? 'admin' : 'user';
      request.user = {
        uid: decoded.uid,
        email: typeof decoded.email === 'string' ? decoded.email : undefined,
        name: typeof decoded.name === 'string' ? decoded.name : undefined,
        role,
      };
      return true;
    } catch (e) {
      // 토큰 값은 로그에 남기지 않는다.
      this.logger.warn(
        `ID 토큰 검증 실패: ${e instanceof Error ? e.message : 'unknown'}`,
      );
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
    }
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
