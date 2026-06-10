import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service.js';
import { TransactionService } from './transaction.service.js';

@Global()
@Module({
  providers: [DatabaseService, TransactionService],
  exports: [DatabaseService, TransactionService],
})
export class DatabaseModule {}
