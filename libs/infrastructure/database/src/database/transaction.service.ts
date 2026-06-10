import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/client.js';
import { DatabaseService } from './database.service.js';

@Injectable()
export class TransactionService {
  constructor(private readonly databaseService: DatabaseService) {}

  run<T>(callback: (transaction: Prisma.TransactionClient) => Promise<T>) {
    return this.databaseService.$transaction(callback);
  }
}
