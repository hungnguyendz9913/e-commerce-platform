import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { type AuthenticatedUser, CurrentUser, Roles, RolesGuard } from '@e-commerce-platform/api-common';
import { CancelOrderDto, ListOrdersQueryDto } from '@e-commerce-platform/api-contracts';
import { Roles as RoleValues } from '@e-commerce-platform/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleValues.CUSTOMER)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getMyOrderList(@CurrentUser() user: AuthenticatedUser, @Query() query: ListOrdersQueryDto) {
    return this.orderService.getMyOrderList(user.userId, query);
  }

  @Get(':id')
  getMyOrderDetail(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.orderService.getMyOrderDetail(user.userId, id);
  }

  @Post(':id/cancel')
  cancelMyOrder(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() cancelOrderDto: CancelOrderDto) {
    return this.orderService.cancelMyOrder(user.userId, id, cancelOrderDto);
  }
}
