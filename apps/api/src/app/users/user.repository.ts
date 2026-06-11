import { DatabaseService, DbClient, Prisma } from '@e-commerce-platform/database';
import type { CreateUserDto, RoleName } from '@e-commerce-platform/types';
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

  async findCurrentUserById(id: string, client: DbClient = this.databaseService) {
    return client.user.findUnique({
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

  async createUserWithRole(createUserDto: CreateUserDto, roleName: RoleName) {
    return this.databaseService.$transaction(async (transaction) => {
      const user = await transaction.user.create({
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
      const role = await transaction.role.upsert({
        where: { name: roleName },
        update: {},
        create: {
          name: roleName,
          description: roleName,
        },
        select: {
          id: true,
          name: true,
        },
      });

      await transaction.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: role.id,
        },
      });

      return {
        ...user,
        role: role.name,
      };
    });
  }

  async updateProfile(id: string, data: Prisma.UserUpdateArgs['data']) {
    return this.databaseService.user.update({
      where: {id},
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }
}
