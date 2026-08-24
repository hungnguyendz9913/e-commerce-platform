import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service.js';
import { Prisma } from '../generated/client.js';

export type TransactionClient = Prisma.TransactionClient;

@Injectable()
export class TransactionService {
  constructor(private readonly databaseService: DatabaseService) {}

  run<T>(callback: (transaction: TransactionClient) => Promise<T>) {
    return this.databaseService.$transaction(callback);
  }

  async runSerializable<T>(
    callback: (transaction: TransactionClient) => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await this.databaseService.$transaction(callback, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        if (!this.isSerializationConflict(error) || attempt >= maxRetries) {
          throw error;
        }
      }
    }
  }

  private isSerializationConflict(error: unknown): error is { code: 'P2034' } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2034'
    );
  }
}

export type DbClient = DatabaseService | Prisma.TransactionClient;
