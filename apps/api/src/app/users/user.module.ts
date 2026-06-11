import { forwardRef, Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { DatabaseModule } from '@e-commerce-platform/database';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { AddressModule } from '../addresses/address.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule), AddressModule],
  exports: [UserService],
  providers: [UserRepository, UserService],
  controllers: [UserController],
})
export class UserModule {}
