import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '@e-commerce-platform/api-common';
import { CreateMyAddressDto, UpdateProfileDto } from '@e-commerce-platform/api-contracts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getCurrentUserProfile(user.userId);
  }

  constructor(private readonly userService: UserService) {}

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.userId, updateProfileDto);
  }

  @Get('me/addresses')
  @UseGuards(JwtAuthGuard)
  getMyAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getMyAddresses(user.userId);
  }

  @Post('me/addresses')
  @UseGuards(JwtAuthGuard)
  createMyAddress(@CurrentUser() user: AuthenticatedUser, @Body() createMyAddressDto: CreateMyAddressDto) {
    return this.userService.createMyAddress(user.userId, createMyAddressDto);
  }
}
