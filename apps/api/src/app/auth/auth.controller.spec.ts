import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
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
      }),
    ).toBe(response);
  });

  it('should call auth service to start forgot-password flow', () => {
    const response = {
      data: {
        message:
          'If the email exists, password reset instructions have been generated.',
        resetToken: 'reset-token',
      },
    };
    authService.forgotPassword.mockReturnValue(response);

    expect(
      controller.forgotPassword({
        email: 'customer@example.com',
      }),
    ).toBe(response);
  });

  it('should call auth service to reset password', () => {
    const response = {
      data: {
        message: 'Password has been reset.',
      },
    };
    authService.resetPassword.mockReturnValue(response);

    expect(
      controller.resetPassword({
        token: 'reset-token',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      }),
    ).toBe(response);
  });
});
