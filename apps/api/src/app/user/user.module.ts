import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { DatabaseModule } from '@e-commerce-platform/database';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule],
  exports: [UserService],
  providers: [UserRepository, UserService],
})
export class UserModule {}
