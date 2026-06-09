import { ConflictException, UnauthorizedException } from '@nestjs/common';
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
  };
  const sessionRepository = {
    createSession: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    passwordService.hash.mockResolvedValue('scrypt:test-hash');
    passwordService.verify.mockResolvedValue(true);
    passwordService.hashToken.mockReturnValue('refresh-token-hash');
    tokenService.createAccessToken.mockReturnValue('access-token');
    tokenService.createRefreshToken.mockReturnValue('refresh-token');

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
      })
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
      })
    );
    expect(userRoleService.assignRoleToUser).toHaveBeenCalledWith(
      'user-id',
      Roles.CUSTOMER
    );
    expect(passwordService.hash).toHaveBeenCalledWith('Password123');
  });

  it('should reject a duplicate email', async () => {
    userService.createUser.mockRejectedValue(
      new ConflictException('Email already exists')
    );

    await expect(
      service.register({
        email: 'customer@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        fullName: 'Nguyen Van A',
      })
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
      })
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
      'customer@example.com'
    );
    expect(passwordService.verify).toHaveBeenCalledWith(
      'Password123',
      'scrypt:test-hash'
    );
    expect(passwordService.hashToken).toHaveBeenCalledWith('refresh-token');
    expect(sessionRepository.createSession).toHaveBeenCalledWith(
      'user-id',
      'refresh-token-hash',
      expect.any(Date)
    );
    expect(tokenService.createAccessToken).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'customer@example.com',
      roles: [Roles.CUSTOMER],
    });
  });

  it('should reject invalid credentials', async () => {
    userService.findUserCredentialsByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'Password123',
      })
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
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessionRepository.createSession).not.toHaveBeenCalled();
  });
});
