import { DatabaseService } from '@e-commerce-platform/database';
import { Injectable } from '@nestjs/common';
import type { CreateUserInput } from './user.service';

@Injectable()
export class UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findUserByEmail(email: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return user;
  }

  async createUser(createUserInput: CreateUserInput) {
    return this.databaseService.user.create({
      data: {
        email: createUserInput.email,
        passwordHash: createUserInput.passwordHash,
        fullName: createUserInput.fullName,
        phone: createUserInput.phone,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
        createdAt: true,
      },
    });
  }
}
