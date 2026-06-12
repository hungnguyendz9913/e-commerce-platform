import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  Roles,
  RolesGuard,
  type AuthenticatedUser,
} from '@e-commerce-platform/api-common';
import { AddItemToCartDto, UpdateCartItemQuantityDto } from '@e-commerce-platform/api-contracts';
import { Roles as RoleValues } from '@e-commerce-platform/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleValues.CUSTOMER)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getMyActiveCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getMyActiveCart(user.userId);
  }

  @Post('/items')
  addItemToCart(@CurrentUser() user: AuthenticatedUser, @Body() addItemToCartDto: AddItemToCartDto) {
    return this.cartService.addItemToCart(user.userId, addItemToCartDto);
  }

  @Patch('/items/:itemId')
  updateCartItemQuantity(@CurrentUser() user: AuthenticatedUser, @Param('itemId') itemId: string, @Body() updateCartItemQuantityDto: UpdateCartItemQuantityDto) {
    return this.cartService.updateCartItemQuantity(user.userId, itemId, updateCartItemQuantityDto);
  }

  @Delete('/items/:itemId')
  removeCartItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeCartItem(user.userId, itemId);
  }

  @Delete()
  clearCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.clearCart(user.userId);
  }
}
