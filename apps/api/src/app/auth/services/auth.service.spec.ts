import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Roles } from '@e-commerce-platform/types';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionRepository } from '../session.repository';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { UserService } from '../../user/user.service';
import { UserRoleService } from '../../user-role/user-role.service';

describe('AuthService', () => {
  let service: AuthService;
  const userService = {
    createUser: jest.fn(),
    findUserCredentialsByEmail: jest.fn(),
    findPasswordResetUserByEmail: jest.fn(),
    findPasswordResetUserById: jest.fn(),
    findCurrentUserById: jest.fn(),
    updatePassword: jest.fn(),
  };
  const userRoleService = {
    assignRoleToUser: jest.fn(),
  };
  const passwordService = {
    hash: jest.fn(),
    verify: jest.fn(),
    hashToken: jest.fn(),
  };
  const tokenService = {
    createAccessToken: jest.fn(),
    createRefreshToken: jest.fn(),
    createPasswordResetToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyPasswordResetToken: jest.fn(),
  };
  const sessionRepository = {
    createSession: jest.fn(),
    findActiveSession: jest.fn(),
    revokeSession: jest.fn(),
    revokeSessionsForUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    passwordService.hash.mockResolvedValue('scrypt:test-hash');
    passwordService.verify.mockResolvedValue(true);
    passwordService.hashToken.mockReturnValue('refresh-token-hash');
    tokenService.createAccessToken.mockReturnValue('access-token');
    tokenService.createRefreshToken.mockReturnValue('refresh-token');
    tokenService.createPasswordResetToken.mockReturnValue('reset-token');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: UserRoleService,
          useValue: userRoleService,
        },
        {
          provide: PasswordService,
          useValue: passwordService,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
        {
          provide: SessionRepository,
          useValue: sessionRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a customer account', async () => {
    const createdAt = new Date('2026-06-08T10:00:00.000Z');
    userService.createUser.mockResolvedValue({
      id: 'user-id',
      email: 'customer@example.com',
      fullName: 'Nguyen Van A',
      status: 'ACTIVE',
      createdAt,
    });
    userRoleService.assignRoleToUser.mockResolvedValue({
      role: { name: Roles.CUSTOMER },
    });

    await expect(
      service.register({
        email: 'Customer@Example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        fullName: 'Nguyen Van A',
        phone: '0900000000',
      }),
    ).resolves.toEqual({
      data: {
        id: 'user-id',
        email: 'customer@example.com',
        fullName: 'Nguyen Van A',
        role: Roles.CUSTOMER,
        status: 'active',
        createdAt: '2026-06-08T10:00:00.000Z',
      },
    });
    expect(userService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'customer@example.com',
        passwordHash: 'scrypt:test-hash',
      }),
    );
    expect(userRoleService.assignRoleToUser).toHaveBeenCalledWith(
      'user-id',
      Roles.CUSTOMER,
    );
    expect(passwordService.hash).toHaveBeenCalledWith('Password123');
  });

  it('should reject a duplicate email', async () => {
    userService.createUser.mockRejectedValue(
      new ConflictException('Email already exists'),
    );

    await expect(
      service.register({
        email: 'customer@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        fullName: 'Nguyen Van A',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should login with valid credentials', async () => {
    userService.findUserCredentialsByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'customer@example.com',
      passwordHash: 'scrypt:test-hash',
      fullName: 'Nguyen Van A',
      status: 'ACTIVE',
      userRoles: [{ role: { name: Roles.CUSTOMER } }],
    });
    sessionRepository.createSession.mockResolvedValue({ id: 'session-id' });

    await expect(
      service.login({
        email: 'Customer@Example.com',
        password: 'Password123',
      }),
    ).resolves.toEqual({
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'customer@example.com',
          fullName: 'Nguyen Van A',
          roles: [Roles.CUSTOMER],
        },
      },
    });
    expect(userService.findUserCredentialsByEmail).toHaveBeenCalledWith(
      'customer@example.com',
    );
    expect(passwordService.verify).toHaveBeenCalledWith(
      'Password123',
      'scrypt:test-hash',
    );
    expect(passwordService.hashToken).toHaveBeenCalledWith('refresh-token');
    expect(sessionRepository.createSession).toHaveBeenCalledWith(
      'user-id',
      'refresh-token-hash',
      expect.any(Date),
    );
    expect(tokenService.createAccessToken).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'customer@example.com',
      roles: [Roles.CUSTOMER],
      sessionId: 'session-id',
    });
  });

  it('should reject invalid credentials', async () => {
    userService.findUserCredentialsByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'Password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(passwordService.verify).not.toHaveBeenCalled();
  });

  it('should reject an invalid password', async () => {
    userService.findUserCredentialsByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'customer@example.com',
      passwordHash: 'scrypt:test-hash',
      fullName: 'Nguyen Van A',
      status: 'ACTIVE',
      userRoles: [{ role: { name: Roles.CUSTOMER } }],
    });
    passwordService.verify.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'customer@example.com',
        password: 'WrongPassword123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessionRepository.createSession).not.toHaveBeenCalled();
  });

  it('should logout the current session', async () => {
    tokenService.verifyAccessToken.mockReturnValue({
      sub: 'user-id',
      email: 'customer@example.com',
      roles: [Roles.CUSTOMER],
      sessionId: 'session-id',
    });
    sessionRepository.findActiveSession.mockResolvedValue({ id: 'session-id' });
    sessionRepository.revokeSession.mockResolvedValue({ count: 1 });

    await expect(service.logout('Bearer access-token')).resolves.toEqual({
      data: {
        success: true,
      },
    });
    expect(tokenService.verifyAccessToken).toHaveBeenCalledWith('access-token');
    expect(sessionRepository.findActiveSession).toHaveBeenCalledWith(
      'session-id',
      'user-id',
    );
    expect(sessionRepository.revokeSession).toHaveBeenCalledWith(
      'session-id',
      'user-id',
    );
  });

  it('should reject logout without a bearer token', async () => {
    await expect(service.logout()).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(sessionRepository.revokeSession).not.toHaveBeenCalled();
  });

  it('should return the current authenticated user', async () => {
    tokenService.verifyAccessToken.mockReturnValue({
      sub: 'user-id',
      email: 'customer@example.com',
      roles: [Roles.CUSTOMER],
      sessionId: 'session-id',
    });
    sessionRepository.findActiveSession.mockResolvedValue({ id: 'session-id' });
    userService.findCurrentUserById.mockResolvedValue({
      id: 'user-id',
      email: 'customer@example.com',
      fullName: 'Nguyen Van A',
      phone: '0900000000',
      status: 'ACTIVE',
      userRoles: [{ role: { name: Roles.CUSTOMER } }],
    });

    await expect(service.me('Bearer access-token')).resolves.toEqual({
      data: {
        id: 'user-id',
        email: 'customer@example.com',
        fullName: 'Nguyen Van A',
        phone: '0900000000',
        roles: [Roles.CUSTOMER],
        status: 'active',
      },
    });
    expect(userService.findCurrentUserById).toHaveBeenCalledWith('user-id');
  });

  it('should reject current user lookup for a revoked session', async () => {
    tokenService.verifyAccessToken.mockReturnValue({
      sub: 'user-id',
      email: 'customer@example.com',
      roles: [Roles.CUSTOMER],
      sessionId: 'session-id',
    });
    sessionRepository.findActiveSession.mockResolvedValue(null);

    await expect(service.me('Bearer access-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(userService.findCurrentUserById).not.toHaveBeenCalled();
  });

  it('should create a password reset token for an active account', async () => {
    userService.findPasswordResetUserByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'customer@example.com',
      passwordHash: 'scrypt:test-hash',
      status: 'ACTIVE',
    });
    passwordService.hashToken.mockReturnValue('password-version');

    await expect(
      service.forgotPassword({ email: 'Customer@Example.com' }),
    ).resolves.toEqual({
      data: {
        message:
          'If the email exists, password reset instructions have been generated.',
        resetToken: 'reset-token',
      },
    });
    expect(userService.findPasswordResetUserByEmail).toHaveBeenCalledWith(
      'customer@example.com',
    );
    expect(tokenService.createPasswordResetToken).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'customer@example.com',
      passwordVersion: 'password-version',
    });
  });

  it('should return a generic forgot-password response for an unknown email', async () => {
    userService.findPasswordResetUserByEmail.mockResolvedValue(null);

    await expect(
      service.forgotPassword({ email: 'missing@example.com' }),
    ).resolves.toEqual({
      data: {
        message:
          'If the email exists, password reset instructions have been generated.',
      },
    });
    expect(tokenService.createPasswordResetToken).not.toHaveBeenCalled();
  });

  it('should reset password with a valid token', async () => {
    tokenService.verifyPasswordResetToken.mockReturnValue({
      sub: 'user-id',
      email: 'customer@example.com',
      passwordVersion: 'password-version',
    });
    userService.findPasswordResetUserById.mockResolvedValue({
      id: 'user-id',
      email: 'customer@example.com',
      passwordHash: 'scrypt:old-hash',
      status: 'ACTIVE',
    });
    passwordService.hashToken.mockReturnValue('password-version');
    passwordService.hash.mockResolvedValue('scrypt:new-hash');

    await expect(
      service.resetPassword({
        token: 'reset-token',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }),
    ).resolves.toEqual({
      data: {
        message: 'Password has been reset.',
      },
    });
    expect(userService.updatePassword).toHaveBeenCalledWith(
      'user-id',
      'scrypt:new-hash',
    );
    expect(sessionRepository.revokeSessionsForUser).toHaveBeenCalledWith(
      'user-id',
    );
  });

  it('should reject an invalid password reset token', async () => {
    tokenService.verifyPasswordResetToken.mockReturnValue(null);

    await expect(
      service.resetPassword({
        token: 'bad-token',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(userService.updatePassword).not.toHaveBeenCalled();
  });

  it('should reject a reset token after the password hash changes', async () => {
    tokenService.verifyPasswordResetToken.mockReturnValue({
      sub: 'user-id',
      email: 'customer@example.com',
      passwordVersion: 'old-password-version',
    });
    userService.findPasswordResetUserById.mockResolvedValue({
      id: 'user-id',
      email: 'customer@example.com',
      passwordHash: 'scrypt:newer-hash',
      status: 'ACTIVE',
    });
    passwordService.hashToken.mockReturnValue('new-password-version');

    await expect(
      service.resetPassword({
        token: 'reset-token',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(userService.updatePassword).not.toHaveBeenCalled();
  });
});
