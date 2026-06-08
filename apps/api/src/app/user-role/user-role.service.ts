import { Injectable } from '@nestjs/common';
import { RoleName } from '@e-commerce-platform/types';
import { UserRoleRepository } from './user-role.repository';

@Injectable()
export class UserRoleService {
  constructor(private readonly userRoleRepository: UserRoleRepository) {}

  async assignRoleToUser(userId: string, roleName: RoleName) {
    const role = await this.userRoleRepository.findOrCreateRole(roleName);
    return this.userRoleRepository.assignRoleToUser(userId, role.id);
  }
}
