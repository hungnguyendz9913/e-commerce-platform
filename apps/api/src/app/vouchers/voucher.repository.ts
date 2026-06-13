import { DatabaseService } from '@e-commerce-platform/database';
import {
  CreateVoucherDto,
  FindVouchersQueryDto,
  UpdateVoucherDto,
} from '@e-commerce-platform/api-contracts';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VoucherRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  findActiveVoucherForProduct(productId: string) {
    const now = new Date();

    return this.databaseService.voucher.findMany({
      where: {
        status: 'ACTIVE',
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
          {
            OR: [
              { scope: 'ORDER' },
              {
                scope: 'PRODUCT',
                products: { some: { productId } },
              },
            ],
          },
        ],
      },
    });
  }

  findActiveVoucherForCategory(categoryId: string) {
    const now = new Date();

    return this.databaseService.voucher.findMany({
      where: {
        status: 'ACTIVE',
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
          {
            OR: [
              { scope: 'ORDER' },
              {
                scope: 'CATEGORY',
                categories: { some: { categoryId } },
              },
            ],
          },
        ],
      },
    });
  }

  createVoucher(createVoucherDto: CreateVoucherDto) {
    return this.databaseService.voucher.create({
      data: createVoucherDto as never,
    });
  }

  async findAllVouchers(query: FindVouchersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      ...(query.q ? { code: { contains: query.q, mode: 'insensitive' } } : {}),
      ...(query.status ? { status: query.status.toUpperCase() } : {}),
      ...(query.scope ? { scope: query.scope.toUpperCase() } : {}),
    };

    const [data, total] = await Promise.all([
      this.databaseService.voucher.findMany({
        where: where as never,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
        },
      }),
      this.databaseService.voucher.count({ where: where as never }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findVoucherById(voucherId: string) {
    return this.databaseService.voucher.findUnique({
      where: { id: voucherId },
    });
  }

  updateVoucher(voucherId: string, updateVoucherDto: UpdateVoucherDto) {
    return this.databaseService.voucher.update({
      where: { id: voucherId },
      data: updateVoucherDto as never,
    });
  }

  deactivateVoucher(voucherId: string) {
    return this.databaseService.voucher.update({
      where: { id: voucherId },
      data: { status: 'INACTIVE' },
    });
  }
}
