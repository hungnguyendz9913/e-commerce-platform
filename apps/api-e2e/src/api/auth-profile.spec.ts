import { UnauthorizedException, ValidationPipe } from '@nestjs/common';
import type {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import axios, { AxiosInstance } from 'axios';
import { Roles } from '@e-commerce-platform/types';
import { AuthController } from '../../../api/src/app/auth/auth.controller';
import type { RequestWithUser } from '../../../api/src/app/auth/authenticated-user';
import { JwtAuthGuard } from '../../../api/src/app/auth/guards/jwt-auth.guard';
import { AuthService } from '../../../api/src/app/auth/services/auth.service';
import { UserController } from '../../../api/src/app/user/user.controller';
import { UserService } from '../../../api/src/app/user/user.service';

const passwordResetMessage =
  'If the email exists, password reset instructions have been generated.';

describe('Auth and profile API baseline', () => {
  let app: INestApplication;
  let client: AxiosInstance;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    meAuthenticated: jest.fn(),
    forgotPassword: jest.fn(),
    refresh: jest.fn(),
    logoutAuthenticated: jest.fn(),
    resetPassword: jest.fn(),
  };
  const userService = {
    getCurrentUserProfile: jest.fn(),
  };
  const authGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest<RequestWithUser>();

      if (request.headers.authorization !== 'Bearer valid-token') {
        throw new UnauthorizedException('Invalid or expired session');
      }

      request.user = {
        userId: 'user-id',
        sessionId: 'session-id',
        roles: [Roles.CUSTOMER],
      };

      return true;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, UserController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(authGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.listen(0);

    client = axios.create({
      baseURL: await app.getUrl(),
      validateStatus: () => true,
    });
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a customer account', async () => {
    authService.register.mockResolvedValue({
      data: {
        id: 'user-id',
        email: 'customer@example.com',
        fullName: 'Nguyen Van A',
        role: Roles.CUSTOMER,
        status: 'active',
        createdAt: '2026-06-08T10:00:00.000Z',
      },
    });

    const response = await client.post('/api/auth/register', {
      email: 'customer@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      fullName: 'Nguyen Van A',
    });

    expect(response.status).toBe(201);
    expect(response.data).toEqual({
      data: {
        id: 'user-id',
        email: 'customer@example.com',
        fullName: 'Nguyen Van A',
        role: Roles.CUSTOMER,
        status: 'active',
        createdAt: '2026-06-08T10:00:00.000Z',
      },
    });
    expect(response.data.data).not.toHaveProperty('password');
    expect(response.data.data).not.toHaveProperty('passwordHash');
  });

  it('should login and return identity with roles', async () => {
    authService.login.mockResolvedValue({
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

    const response = await client.post('/api/auth/login', {
      email: 'customer@example.com',
      password: 'Password123',
    });

    expect(response.status).toBe(201);
    expect(response.data.data.user.roles).toEqual([Roles.CUSTOMER]);
  });

  it('should require auth for auth me', async () => {
    const response = await client.get('/api/auth/me');

    expect(response.status).toBe(401);
  });

  it('should return authenticated identity and roles from auth me', async () => {
    authService.meAuthenticated.mockResolvedValue({
      data: {
        id: 'user-id',
        email: 'customer@example.com',
        fullName: 'Nguyen Van A',
        phone: '0900000000',
        roles: [Roles.CUSTOMER],
        status: 'active',
      },
    });

    const response = await client.get('/api/auth/me', {
      headers: { Authorization: 'Bearer valid-token' },
    });

    expect(response.status).toBe(200);
    expect(response.data.data.roles).toEqual([Roles.CUSTOMER]);
    expect(authService.meAuthenticated).toHaveBeenCalledWith({
      userId: 'user-id',
      sessionId: 'session-id',
      roles: [Roles.CUSTOMER],
    });
  });

  it('should require auth for users me', async () => {
    const response = await client.get('/api/users/me');

    expect(response.status).toBe(401);
  });

  it('should return the current authenticated profile from users me', async () => {
    userService.getCurrentUserProfile.mockResolvedValue({
      data: {
        id: 'user-id',
        email: 'customer@example.com',
        fullName: 'Nguyen Van A',
        phone: '0900000000',
        avatarUrl: null,
        status: 'active',
      },
    });

    const response = await client.get('/api/users/me', {
      headers: { Authorization: 'Bearer valid-token' },
    });

    expect(response.status).toBe(200);
    expect(response.data.data.id).toBe('user-id');
    expect(userService.getCurrentUserProfile).toHaveBeenCalledWith('user-id');
  });

  it('should return a generic forgot-password response for an unknown email', async () => {
    authService.forgotPassword.mockResolvedValue({
      data: {
        message: passwordResetMessage,
      },
    });

    const response = await client.post('/api/auth/forgot-password', {
      email: 'missing@example.com',
    });

    expect(response.status).toBe(201);
    expect(response.data).toEqual({
      data: {
        message: passwordResetMessage,
      },
    });
    expect(response.data.data).not.toHaveProperty('resetToken');
  });
});
