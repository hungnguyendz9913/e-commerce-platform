import { Injectable } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";
import { Prisma } from "../generated/client.js";

export type AppTransaction = Prisma.TransactionClient;

@Injectable()
export class TransactionService {
  constructor(private readonly databaseService: DatabaseService) {}

  run<T>(callback: (tx: AppTransaction) => Promise<T>) {
    return this.databaseService.$transaction(callback);
  }
}