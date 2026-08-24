import { Logger } from '@nestjs/common';
import { DevPasswordResetDeliveryService } from './password-reset-delivery.service';

describe('DevPasswordResetDeliveryService', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalResetUrl = process.env.PASSWORD_RESET_URL;

  afterEach(() => {
    jest.restoreAllMocks();

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalResetUrl === undefined) {
      delete process.env.PASSWORD_RESET_URL;
    } else {
      process.env.PASSWORD_RESET_URL = originalResetUrl;
    }
  });

  it('logs a usable password reset URL in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.PASSWORD_RESET_URL = 'http://localhost:3000/reset-password';
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const service = new DevPasswordResetDeliveryService();

    await service.sendPasswordReset('customer@example.com', 'reset token');

    expect(log).toHaveBeenCalledWith(
      'Password reset for customer@example.com: http://localhost:3000/reset-password?token=reset+token',
    );
  });

  it('refuses to expose reset tokens through the dev adapter in production', () => {
    process.env.NODE_ENV = 'production';

    expect(() => new DevPasswordResetDeliveryService()).toThrow(
      'A production password reset delivery provider must be configured.',
    );
  });
});
