import type { RoleName } from '@e-commerce-platform/types';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
