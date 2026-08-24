import { Injectable, Logger } from '@nestjs/common';

export abstract class PasswordResetDeliveryService {
  abstract sendPasswordReset(email: string, token: string): Promise<void>;
}

@Injectable()
export class DevPasswordResetDeliveryService extends PasswordResetDeliveryService {
  private readonly logger = new Logger(DevPasswordResetDeliveryService.name);

  constructor() {
    super();

    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'A production password reset delivery provider must be configured.',
      );
    }
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl =
      process.env.PASSWORD_RESET_URL ?? 'http://localhost:3000/reset-password';
    const url = new URL(resetUrl);
    url.searchParams.set('token', token);

    this.logger.log(`Password reset for ${email}: ${url.toString()}`);
  }
}
