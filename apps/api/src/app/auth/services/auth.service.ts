import { Roles } from '@e-commerce-platform/types';
import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { UserService } from '../../user/user.service';
import { UserRoleService } from '../../user-role/user-role.service';
import { PasswordService } from './password.service';

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
  }
}
