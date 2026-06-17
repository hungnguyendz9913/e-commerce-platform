import {
  DatabaseService,
  DbClient,
  Prisma,
} from '@e-commerce-platform/database';
import {
  CreateVoucherDto,
  FindVouchersQueryDto,
  UpdateVoucherDto,
  VoucherScope,
  VoucherStatus,
} from '@e-commerce-platform/api-contracts';
import { Injectable } from '@nestjs/common';

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

  findActiveVoucherForCategory(categoryId: string) {
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
                categories: { some: { categoryId } },
              },
            ],
          },
        ],
      },
    });
  }

  async createVoucher(createVoucherDto: CreateVoucherDto) {
    const { productIds, categoryIds, ...voucherData } = createVoucherDto;

    return this.databaseService.voucher.create({
      data: {
        ...voucherData,
        products: productIds?.length
          ? {
              create: productIds.map((productId) => ({ productId })),
            }
          : undefined,
        categories: categoryIds?.length
          ? {
              create: categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
      },
      include: {
        products: true,
        categories: true,
      },
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

  findVoucherForCheckout(
    code: string,
    client: DbClient = this.databaseService,
  ) {
    return client.voucher.findUnique({
      where: { code },
      include: {
        products: true,
        categories: true,
      },
    });
  }

  countVoucherRedemptions(
    voucherId: string,
    client: DbClient = this.databaseService,
  ) {
    return client.voucherRedemption.count({
      where: { voucherId },
    });
  }

  countVoucherRedemptionsForUser(
    voucherId: string,
    userId: string,
    client: DbClient = this.databaseService,
  ) {
    return client.voucherRedemption.count({
      where: { voucherId, userId },
    });
  }

  createVoucherRedemption(
    data: Prisma.VoucherRedemptionCreateArgs['data'],
    client: DbClient = this.databaseService,
  ) {
    return client.voucherRedemption.create({ data });
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
