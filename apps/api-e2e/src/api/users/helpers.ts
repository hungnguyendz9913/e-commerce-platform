/* eslint-disable @nx/enforce-module-boundaries */
import { type INestApplication } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import {
  closeApiTestResources,
  createApiContext,
  createApiTestApp,
  createMockFunction,
  createTokenAuthGuard,
  type MockFunction,
} from '../../support/api-test-app';

const { UserController } =
  require('../../../../api/src/app/users/user.controller') as typeof import('../../../../api/src/app/users/user.controller');
const { UserService } =
  require('../../../../api/src/app/users/user.service') as typeof import('../../../../api/src/app/users/user.service');
const { JwtAuthGuard } =
  require('../../../../api/src/app/auth/guards/jwt-auth.guard') as typeof import('../../../../api/src/app/auth/guards/jwt-auth.guard');

export type UserServiceMock = {
  getCurrentUserProfile: MockFunction;
  updateProfile: MockFunction;
  getMyAddresses: MockFunction;
  createMyAddress: MockFunction;
  updateMyAddress: MockFunction;
  deleteMyAddress: MockFunction;
  setMyAddressToDefault: MockFunction;
};

export function createUserServiceMock(): UserServiceMock {
  return {
    getCurrentUserProfile: createMockFunction(),
    updateProfile: createMockFunction(),
    getMyAddresses: createMockFunction(),
    createMyAddress: createMockFunction(),
    updateMyAddress: createMockFunction(),
    deleteMyAddress: createMockFunction(),
    setMyAddressToDefault: createMockFunction(),
  };
}

export function resetUserServiceMock(userService: UserServiceMock) {
  for (const mock of Object.values(userService)) {
    mock.reset();
  }
}

export function getUserServiceCallCount(userService: UserServiceMock) {
  return Object.values(userService).reduce(
    (callCount, mock) => callCount + mock.calls.length,
    0,
  );
}

export async function createUserApiTestApp(userService: UserServiceMock) {
  const app = await createApiTestApp({
    controllers: [UserController],
    providers: [
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
  const api = await createApiContext(app);

  return { app, api };
}

export async function closeUserApiTestApp(
  app: INestApplication | undefined,
  api: APIRequestContext | undefined,
) {
  await closeApiTestResources(app, api);
}

export function expectDataEnvelope(body: unknown) {
  expect(body).toEqual(expect.objectContaining({ data: expect.anything() }));
}
