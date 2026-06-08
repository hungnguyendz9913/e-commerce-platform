import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
};

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserInput: CreateUserInput) {
    const existingUser = await this.userRepository.findUserByEmail(
      createUserInput.email
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    try {
      return await this.userRepository.createUser(createUserInput);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }
}
