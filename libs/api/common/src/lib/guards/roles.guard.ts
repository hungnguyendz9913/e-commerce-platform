import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RoleName } from '@e-commerce-platform/types';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { RequestWithUser } from '../request/authenticated-user.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles =
      this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userRoles = request.user?.roles ?? [];

    const allowed = requiredRoles.some((role) => userRoles.includes(role));

    if (!allowed) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
