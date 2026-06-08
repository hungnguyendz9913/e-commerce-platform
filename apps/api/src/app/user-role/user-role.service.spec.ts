import { Test, TestingModule } from '@nestjs/testing';
import { Roles } from '@e-commerce-platform/types';
import { UserRoleRepository } from './user-role.repository';
import { UserRoleService } from './user-role.service';

describe('UserRoleService', () => {
  let service: UserRoleService;
  const userRoleRepository = {
    findOrCreateRole: jest.fn(),
    assignRoleToUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRoleService,
        {
          provide: UserRoleRepository,
          useValue: userRoleRepository,
        },
      ],
    }).compile();

    service = module.get<UserRoleService>(UserRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should assign the customer role to a user', async () => {
    userRoleRepository.findOrCreateRole.mockResolvedValue({
      id: 'role-id',
      name: Roles.CUSTOMER,
    });
    userRoleRepository.assignRoleToUser.mockResolvedValue({
      role: { name: Roles.CUSTOMER },
    });

    await expect(
      service.assignRoleToUser('user-id', Roles.CUSTOMER)
    ).resolves.toEqual({
      role: { name: Roles.CUSTOMER },
    });
    expect(userRoleRepository.findOrCreateRole).toHaveBeenCalledWith(
      Roles.CUSTOMER
    );
    expect(userRoleRepository.assignRoleToUser).toHaveBeenCalledWith(
      'user-id',
      'role-id'
    );
  });
});
