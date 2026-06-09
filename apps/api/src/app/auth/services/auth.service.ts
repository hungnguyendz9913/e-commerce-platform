import type { AuthenticatedUser } from '@e-commerce-platform/api-common';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from '@e-commerce-platform/api-contracts';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionRepository } from '../session.repository';
import { UserService } from '../../user/user.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import {
  REFRESH_TOKEN_TTL_DAYS,
  PASSWORD_RESET_MESSAGE,
} from '@e-commerce-platform/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();
    const passwordHash = await this.passwordService.hash(registerDto.password);

    const user = await this.userService.createCustomerUser({
      email,
      passwordHash,
      fullName: registerDto.fullName,
      phone: registerDto.phone,
    });

    return {
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status.toLowerCase(),
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase();
    const user = await this.userService.findUserCredentialsByEmail(email);

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await this.passwordService.verify(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.userRoles.map((userRole) => userRole.role.name);
    const refreshToken = this.tokenService.createRefreshToken();
    const refreshTokenHash = this.passwordService.hashToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    const session = await this.sessionRepository.createSession(
      user.id,
      refreshTokenHash,
      expiresAt,
    );

    return {
      data: {
        accessToken: this.tokenService.createAccessToken({
          sub: user.id,
          email: user.email,
          roles,
          sessionId: session.id,
        }),
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roles,
        },
      },
    };
  }

  async logout(authorizationHeader?: string) {
    const authenticatedUser = await this.authenticate(authorizationHeader);

    return this.logoutAuthenticated(authenticatedUser);
  }

  async logoutAuthenticated(authenticatedUser: AuthenticatedUser) {
    await this.sessionRepository.revokeSession(
      authenticatedUser.sessionId,
      authenticatedUser.userId,
    );

    return {
      data: {
        success: true,
      },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const currentRefreshTokenHash = this.passwordService.hashToken(
      refreshTokenDto.refreshToken,
    );
    const session =
      await this.sessionRepository.findActiveSessionByRefreshTokenHash(
        currentRefreshTokenHash,
      );

    if (!session || session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const nextRefreshToken = this.tokenService.createRefreshToken();
    const nextRefreshTokenHash =
      this.passwordService.hashToken(nextRefreshToken);
    const rotationResult = await this.sessionRepository.rotateRefreshToken(
      session.id,
      currentRefreshTokenHash,
      nextRefreshTokenHash,
    );

    if (rotationResult.count !== 1) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const roles = session.user.userRoles.map((userRole) => userRole.role.name);

    return {
      data: {
        accessToken: this.tokenService.createAccessToken({
          sub: session.user.id,
          email: session.user.email,
          roles,
          sessionId: session.id,
        }),
        refreshToken: nextRefreshToken,
      },
    };
  }

  async me(authorizationHeader?: string) {
    const authenticatedUser = await this.authenticate(authorizationHeader);

    return this.meAuthenticated(authenticatedUser);
  }

  async meAuthenticated(authenticatedUser: AuthenticatedUser) {
    const user = await this.userService.findCurrentUserById(
      authenticatedUser.userId,
    );

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return {
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        roles: user.userRoles.map((userRole) => userRole.role.name),
        status: user.status.toLowerCase(),
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.toLowerCase();
    const user = await this.userService.findPasswordResetUserByEmail(email);

    if (user?.status === 'ACTIVE') {
      this.tokenService.createPasswordResetToken({
        sub: user.id,
        email: user.email,
        passwordVersion: this.passwordService.hashToken(user.passwordHash),
      });
    }

    return {
      data: {
        message: PASSWORD_RESET_MESSAGE,
      },
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const payload = this.tokenService.verifyPasswordResetToken(
      resetPasswordDto.token,
    );

    if (!payload) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userService.findPasswordResetUserById(payload.sub);

    if (
      !user ||
      user.email !== payload.email ||
      user.status !== 'ACTIVE' ||
      this.passwordService.hashToken(user.passwordHash) !==
        payload.passwordVersion
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await this.passwordService.hash(
      resetPasswordDto.password,
    );

    await this.userService.updatePassword(user.id, passwordHash);
    await this.sessionRepository.revokeSessionsForUser(user.id);

    return {
      data: {
        message: 'Password has been reset.',
      },
    };
  }

  async authenticate(authorizationHeader?: string) {
    const token = this.extractBearerToken(authorizationHeader);
    const payload = token ? this.tokenService.verifyAccessToken(token) : null;

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const session = await this.sessionRepository.findActiveSession(
      payload.sessionId,
      payload.sub,
    );

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return {
      userId: payload.sub,
      sessionId: payload.sessionId,
      roles: payload.roles,
    };
  }

  private extractBearerToken(authorizationHeader?: string) {
    const [scheme, token] = authorizationHeader?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
