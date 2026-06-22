import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '@e-commerce-platform/api-common';
import { CreateMyAddressDto, UpdateMyAddressDto, UpdateProfileDto } from '@e-commerce-platform/api-contracts';
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

  @Patch('me/addresses/:addressId')
  @UseGuards(JwtAuthGuard)
  updateMyAddress(@CurrentUser() user: AuthenticatedUser, @Param('addressId') addressId: string, @Body() updateMyAddressDto: UpdateMyAddressDto) {
    return this.userService.updateMyAddress(user.userId, addressId, updateMyAddressDto);
  }

  @Delete('me/addresses/:addressId')
  @UseGuards(JwtAuthGuard)
  deleteMyAddress(@CurrentUser() user: AuthenticatedUser, @Param('addressId') addressId: string) {
    return this.userService.deleteMyAddress(user.userId, addressId);
  }

  @Patch('me/addresses/:addressId/default')
  @UseGuards(JwtAuthGuard)
  setMyAddressToDefault(@CurrentUser() user: AuthenticatedUser, @Param('addressId') addressId: string) {
    return this.userService.setMyAddressToDefault(user.userId, addressId);
  }
}
