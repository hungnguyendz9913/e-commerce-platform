import { TokenService } from './token.service';

describe('TokenService', () => {
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it('fails during construction when JWT_SECRET is missing or blank', () => {
    delete process.env.JWT_SECRET;
    expect(() => new TokenService()).toThrow(
      'JWT_SECRET environment variable is required.',
    );

    process.env.JWT_SECRET = '   ';
    expect(() => new TokenService()).toThrow(
      'JWT_SECRET environment variable is required.',
    );
  });

  it('signs and verifies tokens with an explicitly configured secret', () => {
    process.env.JWT_SECRET = 'test-only-jwt-secret';
    const service = new TokenService();

    const token = service.createAccessToken({
      sub: 'user-id',
      email: 'user@example.com',
      roles: ['customer'],
      sessionId: 'session-id',
    });

    expect(service.verifyAccessToken(token)).toEqual({
      sub: 'user-id',
      email: 'user@example.com',
      roles: ['customer'],
      sessionId: 'session-id',
    });
  });
});
