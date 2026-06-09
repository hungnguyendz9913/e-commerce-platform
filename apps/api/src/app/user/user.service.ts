import type { CreateUserDto } from '@e-commerce-platform/types';
import { prismaError, PrismaErrorCode } from '@e-commerce-platform/utils';
import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findUserByEmail(
      createUserDto.email
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

  findUserCredentialsByEmail(email: string) {
    return this.userRepository.findUserCredentialsByEmail(email);
  }
}
