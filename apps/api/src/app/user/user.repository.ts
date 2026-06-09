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

  async findUserCredentialsByEmail(email: string) {
    return this.databaseService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        fullName: true,
        status: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findPasswordResetUserByEmail(email: string) {
    return this.databaseService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        status: true,
      },
    });
  }

  async findPasswordResetUserById(id: string) {
    return this.databaseService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        status: true,
      },
    });
  }

  async findCurrentUserById(id: string) {
    return this.databaseService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        status: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.databaseService.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: {
        id: true,
      },
    });
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
