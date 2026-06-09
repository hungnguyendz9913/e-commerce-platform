import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import type { RequestWithUser } from '../authenticated-user';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorizationHeader = request.headers.authorization;

    const authenticatedUser = await this.authService.authenticate(
      authorizationHeader,
    );

    if (!authenticatedUser) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    request.user = authenticatedUser;

    return true;
  }
}
