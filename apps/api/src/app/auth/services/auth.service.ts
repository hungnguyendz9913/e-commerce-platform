import { Roles } from '@e-commerce-platform/types';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { SessionRepository } from '../session.repository';
import { UserService } from '../../user/user.service';
import { UserRoleService } from '../../user-role/user-role.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { REFRESH_TOKEN_TTL_DAYS, PASSWORD_RESET_MESSAGE } from '@e-commerce-platform/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRoleService: UserRoleService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();
    const passwordHash = await this.passwordService.hash(registerDto.password);

    const user = await this.userService.createUser({
      email,
      passwordHash,
      fullName: registerDto.fullName,
      phone: registerDto.phone,
    });
    const userRole = await this.userRoleService.assignRoleToUser(
      user.id,
      Roles.CUSTOMER,
    );

    return {
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: userRole.role.name ?? Roles.CUSTOMER,
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

    await this.sessionRepository.createSession(
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.toLowerCase();
    const user = await this.userService.findPasswordResetUserByEmail(email);

    if (!user || user.status !== 'ACTIVE') {
      return {
        data: {
          message: PASSWORD_RESET_MESSAGE,
        },
      };
    }

    const resetToken = this.tokenService.createPasswordResetToken({
      sub: user.id,
      email: user.email,
      passwordVersion: this.passwordService.hashToken(user.passwordHash),
    });

    return {
      data: {
        message: PASSWORD_RESET_MESSAGE,
        resetToken,
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
}
