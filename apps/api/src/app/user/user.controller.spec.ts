import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/services/auth.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  const userService = {
    getCurrentUserProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call user service to get my profile', () => {
    const response = {
      data: {
        id: 'user-id',
        email: 'customer@example.com',
        fullName: 'Nguyen Van A',
        phone: '0900000000',
        avatarUrl: null,
        status: 'active',
      },
    };
    userService.getCurrentUserProfile.mockReturnValue(response);

    expect(
      controller.me({
        userId: 'user-id',
        sessionId: 'session-id',
        roles: ['customer'],
      }),
    ).toBe(response);
    expect(userService.getCurrentUserProfile).toHaveBeenCalledWith('user-id');
  });
});
