import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { SessionRepository } from './session.repository';
import { UserRoleModule } from '../user-role/user-role.module';

@Module({
  imports: [UserModule, UserRoleModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService, SessionRepository],
})
export class AuthModule {}
