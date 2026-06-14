import { DatabaseService, Prisma } from '@e-commerce-platform/database';
import {
  CreateVoucherDto,
  FindVouchersQueryDto,
  UpdateVoucherDto,
} from '@e-commerce-platform/api-contracts';
import { Injectable } from '@nestjs/common';
import { VoucherScope, VoucherStatus } from '@e-commerce-platform/types';

@Injectable()
export class VoucherRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  findActiveVoucherForProduct(productId: string) {
    const now = new Date();

    return this.databaseService.voucher.findMany({
      where: {
        status: VoucherStatus.ACTIVE,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
          },
          {
            OR: [
              { scope: VoucherScope.ORDER },
              {
                scope: VoucherScope.PRODUCT,
                products: { some: { productId } },
              },
            ],
          },
        ],
      },
    });
  }

  findActiveVoucherForCategory(productId: string) {
    const now = new Date();

    return this.databaseService.voucher.findMany({
      where: {
        status: VoucherStatus.ACTIVE,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
          },
          {
            OR: [
              { scope: VoucherScope.ORDER },
              {
                scope: VoucherScope.CATEGORY,
                products: { some: { productId } },
              },
            ],
          },
        ],
      },
    });
  }

  createVoucher(createVoucherDto: CreateVoucherDto) {
    const data: Prisma.VoucherCreateInput = {
      code: createVoucherDto.code,
      discountType: createVoucherDto.discountType,
      discountValue: createVoucherDto.discountValue,

      minimumOrderAmount: createVoucherDto.minimumOrderAmount ?? null,
      maximumDiscountAmount: createVoucherDto.maximumDiscountAmount ?? null,
      usageLimit: createVoucherDto.usageLimit ?? null,
      perUserLimit: createVoucherDto.perUserLimit ?? null,

      startsAt: createVoucherDto.startsAt ?? null,
      expiresAt: createVoucherDto.expiresAt ?? null,

      status: createVoucherDto.status,
      scope: createVoucherDto.scope,
    };

    return this.databaseService.voucher.create({
      data
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
    const data: Prisma.VoucherUpdateInput = {
      code: updateVoucherDto.code,
      discountType: updateVoucherDto.discountType,
      discountValue: updateVoucherDto.discountValue,

      minimumOrderAmount: updateVoucherDto.minimumOrderAmount,
      maximumDiscountAmount: updateVoucherDto.maximumDiscountAmount,
      usageLimit: updateVoucherDto.usageLimit,
      perUserLimit: updateVoucherDto.perUserLimit,

      startsAt: updateVoucherDto.startsAt,
      expiresAt: updateVoucherDto.expiresAt,

      status: updateVoucherDto.status,
      scope: updateVoucherDto.scope,
    };

    return this.databaseService.voucher.update({
      where: { id: voucherId },
      data,
    });
  }

  deactivateVoucher(voucherId: string) {
    return this.databaseService.voucher.update({
      where: { id: voucherId },
      data: { status: VoucherStatus.INACTIVE },
    });
  }
}
