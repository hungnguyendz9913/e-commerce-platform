import { ConflictException } from '@nestjs/common';
import { Roles } from '@e-commerce-platform/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { UserService } from '../../user/user.service';
import { UserRoleService } from '../../user-role/user-role.service';

describe('AuthService', () => {
  let service: AuthService;
  const userService = {
    createUser: jest.fn(),
  };
  const userRoleService = {
    assignRoleToUser: jest.fn(),
  };
  const passwordService = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    passwordService.hash.mockResolvedValue('scrypt:test-hash');

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
});
