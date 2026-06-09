import { DatabaseService } from '@e-commerce-platform/database';
import { Roles } from '@e-commerce-platform/types';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  it('should create a user and assign a role in one transaction', async () => {
    const createdAt = new Date('2026-06-08T10:00:00.000Z');
    const transaction = {
      user: {
        create: jest.fn().mockResolvedValue({
          id: 'user-id',
          email: 'customer@example.com',
          fullName: 'Nguyen Van A',
          status: 'ACTIVE',
          createdAt,
        }),
      },
      role: {
        upsert: jest.fn().mockResolvedValue({
          id: 'role-id',
          name: Roles.CUSTOMER,
        }),
      },
      userRole: {
        upsert: jest.fn().mockResolvedValue({
          role: { name: Roles.CUSTOMER },
        }),
      },
    };
    const databaseService = {
      $transaction: jest.fn((callback) => callback(transaction)),
    };
    const repository = new UserRepository(
      databaseService as unknown as DatabaseService,
    );

    await expect(
      repository.createUserWithRole(
        {
          email: 'customer@example.com',
          passwordHash: 'scrypt:test-hash',
          fullName: 'Nguyen Van A',
          phone: '0900000000',
        },
        Roles.CUSTOMER,
      ),
    ).resolves.toEqual({
      id: 'user-id',
      email: 'customer@example.com',
      fullName: 'Nguyen Van A',
      role: Roles.CUSTOMER,
      status: 'ACTIVE',
      createdAt,
    });
    expect(databaseService.$transaction).toHaveBeenCalledTimes(1);
    expect(transaction.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'customer@example.com',
          passwordHash: 'scrypt:test-hash',
        }),
      }),
    );
    expect(transaction.role.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: Roles.CUSTOMER },
      }),
    );
    expect(transaction.userRole.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: {
          userId: 'user-id',
          roleId: 'role-id',
        },
      }),
    );
  });
});
