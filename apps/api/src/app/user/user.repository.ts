import { DatabaseService } from '@e-commerce-platform/database';
import type { CreateUserDto } from '@e-commerce-platform/types';
import { Injectable } from '@nestjs/common';

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

  async createUser(createUserDto: CreateUserDto) {
    return this.databaseService.user.create({
      data: {
        email: createUserDto.email,
        passwordHash: createUserDto.passwordHash,
        fullName: createUserDto.fullName,
        phone: createUserDto.phone,
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
