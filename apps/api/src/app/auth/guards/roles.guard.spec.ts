import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '@e-commerce-platform/api-common';
import { Roles } from '@e-commerce-platform/types';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  let guard: RolesGuard;

  beforeEach(() => {
    jest.resetAllMocks();
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  function createContext(roles: string[]): ExecutionContext {
    const request = {
      user: {
        userId: 'user-id',
        sessionId: 'session-id',
        roles,
      },
    };

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext([Roles.CUSTOMER]))).toBe(true);
  });

  it('should deny a customer for an admin-only route', () => {
    reflector.getAllAndOverride.mockReturnValue([Roles.ADMIN]);

    expect(() => guard.canActivate(createContext([Roles.CUSTOMER]))).toThrow(
      ForbiddenException,
    );
  });

  it('should allow an admin for an admin-only route', () => {
    reflector.getAllAndOverride.mockReturnValue([Roles.ADMIN]);

    expect(guard.canActivate(createContext([Roles.ADMIN]))).toBe(true);
  });
});
