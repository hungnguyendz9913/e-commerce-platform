import { DatabaseService } from '@e-commerce-platform/database';
import { RoleName } from '@e-commerce-platform/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRoleRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findOrCreateRole(roleName: RoleName) {
    return this.databaseService.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: roleName,
      },
      select: { id: true, name: true },
    });
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return this.databaseService.userRole.create({
      data: {
        userId,
        roleId,
      },
      select: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
