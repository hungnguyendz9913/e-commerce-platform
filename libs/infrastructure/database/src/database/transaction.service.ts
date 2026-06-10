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
}

export type DbClient = DatabaseService | Prisma.TransactionClient;