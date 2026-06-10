import {
  UnauthorizedException,
  ValidationPipe,
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  type Provider,
  type Type,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  request as playwrightRequest,
  type APIRequestContext,
} from '@playwright/test';
import type {
  AuthenticatedUser,
  RequestWithUser,
} from '@e-commerce-platform/api-common';
import { Roles } from '@e-commerce-platform/types';

type MockImplementation<Args extends unknown[], Result> = (
  ...args: Args
) => Result | Promise<Result>;

export type MockFunction<Args extends unknown[] = unknown[], Result = unknown> =
  MockImplementation<Args, Result> & {
    calls: Args[];
    mockResolvedValue(value: Awaited<Result>): void;
    mockRejectedValue(error: unknown): void;
    mockImplementation(implementation: MockImplementation<Args, Result>): void;
    reset(): void;
  };

export function createMockFunction<
  Args extends unknown[] = unknown[],
  Result = unknown,
>(): MockFunction<Args, Result> {
  let implementation: MockImplementation<Args, Result> | undefined;

  const mockFunction = ((...args: Args) => {
    mockFunction.calls.push(args);

    if (!implementation) {
      return undefined as Result;
    }

    return implementation(...args);
  }) as MockFunction<Args, Result>;

  mockFunction.calls = [];
  mockFunction.mockResolvedValue = (value) => {
    implementation = () => Promise.resolve(value) as Result;
  };
  mockFunction.mockRejectedValue = (error) => {
    implementation = () => Promise.reject(error) as Result;
  };
  mockFunction.mockImplementation = (nextImplementation) => {
    implementation = nextImplementation;
  };
  mockFunction.reset = () => {
    mockFunction.calls = [];
    implementation = undefined;
  };

  return mockFunction;
}

export async function createApiTestApp(options: {
  controllers: Type<unknown>[];
  providers: Provider[];
  overrideGuards?: Array<{ guard: Type<CanActivate>; value: CanActivate }>;
}) {
  let testingModuleBuilder = Test.createTestingModule({
    controllers: options.controllers,
    providers: options.providers,
  });

  for (const overrideGuard of options.overrideGuards ?? []) {
    testingModuleBuilder = testingModuleBuilder
      .overrideGuard(overrideGuard.guard)
      .useValue(overrideGuard.value);
  }

  const moduleRef = await testingModuleBuilder.compile();
  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  await app.listen(0);

  return app;
}

export async function createApiContext(app: INestApplication) {
  return playwrightRequest.newContext({
    baseURL: await app.getUrl(),
  });
}

export async function closeApiTestResources(
  app: INestApplication | undefined,
  api: APIRequestContext | undefined,
) {
  await api?.dispose();
  await app?.close();
}

export function createTokenAuthGuard(
  usersByToken: Record<string, AuthenticatedUser> = defaultUsersByToken,
): CanActivate {
  return {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const authorizationHeader = request.headers.authorization;
      const token = authorizationHeader?.replace(/^Bearer\s+/i, '');
      const user = token ? usersByToken[token] : undefined;

      if (!user) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      request.user = user;

      return true;
    },
  };
}

export const defaultUsersByToken: Record<string, AuthenticatedUser> = {
  'valid-token': {
    userId: 'user-id',
    sessionId: 'session-id',
    roles: [Roles.CUSTOMER],
  },
  'customer-token': {
    userId: 'customer-id',
    sessionId: 'customer-session-id',
    roles: [Roles.CUSTOMER],
  },
  'admin-token': {
    userId: 'admin-id',
    sessionId: 'admin-session-id',
    roles: [Roles.ADMIN],
  },
};

export const adminHeaders = {
  Authorization: 'Bearer admin-token',
};

export const customerHeaders = {
  Authorization: 'Bearer customer-token',
};
