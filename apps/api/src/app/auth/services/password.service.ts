import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

@Injectable()
export class PasswordService {
  async hash(password: string) {
    const salt = randomBytes(16).toString('base64url');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }
}
