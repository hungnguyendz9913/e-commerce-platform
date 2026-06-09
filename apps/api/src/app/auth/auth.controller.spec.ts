import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call auth service to login', () => {
    const response = {
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'customer@example.com',
          fullName: 'Nguyen Van A',
          roles: ['customer'],
        },
      },
    };
    authService.login.mockReturnValue(response);

    expect(
      controller.login({
        email: 'customer@example.com',
        password: 'Password123',
      })
    ).toBe(response);
  });
});
