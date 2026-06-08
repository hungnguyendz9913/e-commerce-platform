import { ConflictException, Injectable } from '@nestjs/common';
import { Roles } from '@e-commerce-platform/types';
import { RegisterDto } from '../dtos/register.dto';
import { UserService } from '../../user/user.service';
import { UserRoleService } from '../../user-role/user-role.service';
import { PasswordService } from './password.service';

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRoleService: UserRoleService,
    private readonly passwordService: PasswordService
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();
    const passwordHash = await this.passwordService.hash(registerDto.password);

    try {
      const user = await this.userService.createUser({
        email,
        passwordHash,
        fullName: registerDto.fullName,
        phone: registerDto.phone,
      });
      const userRole = await this.userRoleService.assignRoleToUser(
        user.id,
        Roles.CUSTOMER
      );

      return {
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: userRole.role.name ?? Roles.CUSTOMER,
          status: user.status.toLowerCase(),
          createdAt: user.createdAt.toISOString(),
        },
      };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }
}
