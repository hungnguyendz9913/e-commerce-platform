import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

type AccessTokenPayload = {
  sub: string;
  email: string;
  roles: string[];
};

type PasswordResetTokenPayload = {
  sub: string;
  email: string;
  passwordVersion: string;
};

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const PASSWORD_RESET_TOKEN_TTL_SECONDS = 60 * 60;

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value).toString('base64url');
}

@Injectable()
export class TokenService {
  createAccessToken(payload: AccessTokenPayload) {
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      type: 'access',
      iat: now,
      exp: now + ACCESS_TOKEN_TTL_SECONDS,
    };

    return this.signJwt(tokenPayload);
  }

  createRefreshToken() {
    return randomBytes(48).toString('base64url');
  }

  createPasswordResetToken(payload: PasswordResetTokenPayload) {
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      type: 'password-reset',
      iat: now,
      exp: now + PASSWORD_RESET_TOKEN_TTL_SECONDS,
    };

    return this.signJwt(tokenPayload);
  }

  verifyPasswordResetToken(token: string) {
    const payload = this.verifyJwt(token);

    if (
      payload?.type !== 'password-reset' ||
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.passwordVersion !== 'string'
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      passwordVersion: payload.passwordVersion,
    };
  }

  private signJwt(payload: Record<string, unknown>) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', this.secret)
      .update(unsignedToken)
      .digest('base64url');

    return `${unsignedToken}.${signature}`;
  }

  private verifyJwt(token: string) {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = createHmac('sha256', this.secret)
      .update(unsignedToken)
      .digest('base64url');

    if (!this.equalSignatures(signature, expectedSignature)) {
      return null;
    }

    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as Record<string, unknown>;

      if (
        typeof payload.exp !== 'number' ||
        payload.exp < Math.floor(Date.now() / 1000)
      ) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private equalSignatures(signature: string, expectedSignature: string) {
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    return (
      signatureBuffer.length === expectedSignatureBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    );
  }

  private get secret() {
    return process.env.JWT_SECRET ?? 'development-secret-change-me';
  }
}
