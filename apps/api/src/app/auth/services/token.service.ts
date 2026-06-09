import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes } from 'node:crypto';

type AccessTokenPayload = {
  sub: string;
  email: string;
  roles: string[];
};

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

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

  private get secret() {
    return process.env.JWT_SECRET ?? 'development-secret-change-me';
  }
}
