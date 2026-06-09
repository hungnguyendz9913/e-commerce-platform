import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { SessionRepository } from './session.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from '@e-commerce-platform/api-common';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    SessionRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
