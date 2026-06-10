import { Injectable } from '@nestjs/common';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

@Injectable()
export class PasswordService {
  async hash(password: string) {
    const salt = randomBytes(16).toString('base64url');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  async verify(password: string, passwordHash: string) {
    const [, salt, key] = passwordHash.split(':');

    if (!salt || !key) {
      return false;
    }

    const expectedKey = Buffer.from(key, 'hex');
    const actualKey = (await scryptAsync(
      password,
      salt,
      expectedKey.length,
    )) as Buffer;

    return (
      actualKey.length === expectedKey.length &&
      timingSafeEqual(actualKey, expectedKey)
    );
  }

  hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
