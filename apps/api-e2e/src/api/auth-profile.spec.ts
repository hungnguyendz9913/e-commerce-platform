/* eslint-disable @nx/enforce-module-boundaries */
import type { INestApplication } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { Roles } from '@e-commerce-platform/types';
import { AuthController } from '../../../api/src/app/auth/auth.controller';
import { JwtAuthGuard } from '../../../api/src/app/auth/guards/jwt-auth.guard';
import { AuthService } from '../../../api/src/app/auth/services/auth.service';
import { UserController } from '../../../api/src/app/users/user.controller';
import { UserService } from '../../../api/src/app/users/user.service';
import {
  closeApiTestResources,
  createApiContext,
  createApiTestApp,
  createMockFunction,
  createTokenAuthGuard,
} from '../support/api-test-app';

const passwordResetMessage =
  'If the email exists, password reset instructions have been generated.';

test.describe('Auth and profile API baseline', () => {
  let app: INestApplication;
  let api: APIRequestContext;

  const authService = {
    register: createMockFunction(),
    login: createMockFunction(),
    meAuthenticated: createMockFunction(),
    forgotPassword: createMockFunction(),
    refresh: createMockFunction(),
    logoutAuthenticated: createMockFunction(),
    resetPassword: createMockFunction(),
  };
  const userService = {
    getCurrentUserProfile: createMockFunction(),
  };

  test.beforeAll(async () => {
    app = await createApiTestApp({
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
      overrideGuards: [
        {
          guard: JwtAuthGuard,
          value: createTokenAuthGuard(),
        },
      ],
    });
    api = await createApiContext(app);
  });

  test.beforeEach(() => {
    for (const mock of [
      ...Object.values(authService),
      ...Object.values(userService),
    ]) {
      mock.reset();
    }
  });

  test.afterAll(async () => {
    await closeApiTestResources(app, api);
  });

  test('should register a customer account', async () => {
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

    const response = await api.post('/api/auth/register', {
      data: {
        email: 'customer@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        fullName: 'Nguyen Van A',
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body).toEqual({
      data: {
        id: 'user-id',
        email: 'customer@example.com',
        fullName: 'Nguyen Van A',
        role: Roles.CUSTOMER,
        status: 'active',
        createdAt: '2026-06-08T10:00:00.000Z',
      },
    });
    expect(body.data).not.toHaveProperty('password');
    expect(body.data).not.toHaveProperty('passwordHash');
  });

  test('should login and return identity with roles', async () => {
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

    const response = await api.post('/api/auth/login', {
      data: {
        email: 'customer@example.com',
        password: 'Password123',
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.data.user.roles).toEqual([Roles.CUSTOMER]);
  });

  test('should require auth for auth me', async () => {
    const response = await api.get('/api/auth/me');

    expect(response.status()).toBe(401);
  });

  test('should return authenticated identity and roles from auth me', async () => {
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

    const response = await api.get('/api/auth/me', {
      headers: { Authorization: 'Bearer valid-token' },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.roles).toEqual([Roles.CUSTOMER]);
    expect(authService.meAuthenticated.calls).toEqual([
      [
        {
          userId: 'user-id',
          sessionId: 'session-id',
          roles: [Roles.CUSTOMER],
        },
      ],
    ]);
  });

  test('should require auth for users me', async () => {
    const response = await api.get('/api/users/me');

    expect(response.status()).toBe(401);
  });

  test('should return the current authenticated profile from users me', async () => {
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

    const response = await api.get('/api/users/me', {
      headers: { Authorization: 'Bearer valid-token' },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.id).toBe('user-id');
    expect(userService.getCurrentUserProfile.calls).toEqual([['user-id']]);
  });

  test('should return a generic forgot-password response for an unknown email', async () => {
    authService.forgotPassword.mockResolvedValue({
      data: {
        message: passwordResetMessage,
      },
    });

    const response = await api.post('/api/auth/forgot-password', {
      data: {
        email: 'missing@example.com',
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body).toEqual({
      data: {
        message: passwordResetMessage,
      },
    });
    expect(body.data).not.toHaveProperty('resetToken');
  });
});
