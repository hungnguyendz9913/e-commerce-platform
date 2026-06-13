import { Injectable } from '@nestjs/common';
import {
  CreateVoucherDto,
  FindVouchersQueryDto,
  UpdateVoucherDto,
} from '@e-commerce-platform/api-contracts';
import { VoucherRepository } from './voucher.repository';

@Injectable()
export class VoucherService {
  constructor(private readonly voucherRepository: VoucherRepository) {}

  async findActiveVoucherForProduct(productId: string) {
    return this.findActiveVouchersForProduct(productId);
  }

  async findActiveVouchersForProduct(productId: string) {
    return this.voucherRepository.findActiveVoucherForProduct(productId);
  }

  async findActiveVouchersForCategory(categoryId: string) {
    return this.voucherRepository.findActiveVoucherForCategory(categoryId);
  }

  async createVoucher(createVoucherDto: CreateVoucherDto) {
    return this.voucherRepository.createVoucher(createVoucherDto);
  }

  async findAllVouchers(query: FindVouchersQueryDto) {
    return this.voucherRepository.findAllVouchers(query);
  }

  async findVoucherById(voucherId: string) {
    return this.voucherRepository.findVoucherById(voucherId);
  }

  async updateVoucherBeforeStart(
    voucherId: string,
    updateVoucherDto: UpdateVoucherDto,
  ) {
    return this.voucherRepository.updateVoucher(voucherId, updateVoucherDto);
  }

  async deactivateVoucher(voucherId: string) {
    return this.voucherRepository.deactivateVoucher(voucherId);
  }
}
