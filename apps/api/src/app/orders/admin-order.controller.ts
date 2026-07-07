import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  AdminUpdateStatusDto,
  ListOrdersQueryDto,
} from '@e-commerce-platform/api-contracts';
import {
  type AuthenticatedUser,
  CurrentUser,
  RolesGuard,
  Roles,
} from '@e-commerce-platform/api-common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles as RoleValues } from '@e-commerce-platform/types';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleValues.ADMIN)
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getOrderList(@Query() query: ListOrdersQueryDto) {
    return this.orderService.getAdminOrderList(query);
  }

  @Get(':orderId')
  getOrderDetail(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.orderService.getAdminOrderDetail(orderId);
  }

  @Patch(':orderId/status')
  updateOrderStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: AdminUpdateStatusDto,
  ) {
    return this.orderService.adminUpdateStatus(orderId, dto, user.userId);
  }
}
