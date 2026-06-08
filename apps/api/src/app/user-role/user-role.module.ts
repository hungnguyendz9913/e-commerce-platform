import { Module } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { UserRoleRepository } from './user-role.repository';
import { DatabaseModule } from '@e-commerce-platform/database';

@Module({
  imports: [DatabaseModule],
  exports: [UserRoleService],
  providers: [UserRoleRepository, UserRoleService],
})
export class UserRoleModule {}
