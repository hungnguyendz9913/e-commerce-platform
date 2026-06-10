import { Roles, type CreateUserDto } from '@e-commerce-platform/types';
import { prismaError, PrismaErrorCode } from '@e-commerce-platform/utils';
import {
  ConflictException,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UpdateProfileDto } from '@e-commerce-platform/api-contracts';
import { Prisma } from '@e-commerce-platform/database';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findUserByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    try {
      return await this.userRepository.createUser(createUserDto);
    } catch (error) {
      if (prismaError(error, PrismaErrorCode.UniqueConstraint)) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async createCustomerUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findUserByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    try {
      return await this.userRepository.createUserWithRole(
        createUserDto,
        Roles.CUSTOMER,
      );
    } catch (error) {
      if (prismaError(error, PrismaErrorCode.UniqueConstraint)) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  findUserCredentialsByEmail(email: string) {
    return this.userRepository.findUserCredentialsByEmail(email);
  }

  findPasswordResetUserByEmail(email: string) {
    return this.userRepository.findPasswordResetUserByEmail(email);
  }

  findPasswordResetUserById(id: string) {
    return this.userRepository.findPasswordResetUserById(id);
  }

  findCurrentUserById(id: string) {
    return this.userRepository.findCurrentUserById(id);
  }

  async getCurrentUserProfile(id: string) {
    const user = await this.userRepository.findCurrentUserById(id);

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return {
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        status: user.status.toLowerCase(),
      },
    };
  }

  updatePassword(userId: string, passwordHash: string) {
    return this.userRepository.updatePassword(userId, passwordHash);
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const data: Prisma.UserUpdateArgs['data'] = {
      fullName: updateProfileDto.fullName ?? undefined,
      phone: updateProfileDto.phone ?? undefined,
      avatarUrl: updateProfileDto.avatarUrl ?? undefined,
    };

    if (Object.values(data).every((value) => value === undefined)) {
      throw new BadRequestException('No profile fields provided for update');
    }

    return this.userRepository.updateProfile(id, data);
  }
}
