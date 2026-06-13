import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateVoucherDto,
  FindVouchersQueryDto,
  UpdateVoucherDto,
} from '@e-commerce-platform/api-contracts';
import { Roles, RolesGuard } from '@e-commerce-platform/api-common';
import { Roles as RoleValues } from '@e-commerce-platform/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VoucherService } from './voucher.service';

@Controller()
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get('vouchers/products/:productId')
  findActiveVouchersForProduct(@Param('productId') productId: string) {
    return this.voucherService.findActiveVouchersForProduct(productId);
  }

  @Get('vouchers/categories/:categoryId')
  findActiveVouchersForCategory(@Param('categoryId') categoryId: string) {
    return this.voucherService.findActiveVouchersForCategory(categoryId);
  }

  @Post('admin/vouchers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleValues.ADMIN)
  createVoucher(@Body() createVoucherDto: CreateVoucherDto) {
    return this.voucherService.createVoucher(createVoucherDto);
  }

  @Get('admin/vouchers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleValues.ADMIN)
  findAllVouchers(@Query() query: FindVouchersQueryDto) {
    return this.voucherService.findAllVouchers(query);
  }

  @Get('admin/vouchers/:voucherId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleValues.ADMIN)
  findVoucherById(@Param('voucherId') voucherId: string) {
    return this.voucherService.findVoucherById(voucherId);
  }

  @Patch('admin/vouchers/:voucherId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleValues.ADMIN)
  updateVoucher(
    @Param('voucherId') voucherId: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ) {
    return this.voucherService.updateVoucherBeforeStart(
      voucherId,
      updateVoucherDto,
    );
  }

  @Patch('admin/vouchers/:voucherId/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleValues.ADMIN)
  deactivateVoucher(@Param('voucherId') voucherId: string) {
    return this.voucherService.deactivateVoucher(voucherId);
  }
}
