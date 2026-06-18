import { Injectable, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import {
  CreateVoucherDto,
  DiscountType,
  FindVouchersQueryDto,
  UpdateVoucherDto,
  VoucherScope,
  VoucherStatus,
} from '@e-commerce-platform/api-contracts';
import { VoucherRepository } from './voucher.repository';
import {
  CreateVoucherRedemptionParams,
  ValidateVoucherForCheckoutParams,
  ValidatedVoucherForCheckout,
  VoucherCheckoutCartItem,
} from './voucher-checkout.types';
import { DbClient } from '@e-commerce-platform/database';

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
    const voucher = await this.voucherRepository.findVoucherById(voucherId);
    if (!voucher) {
      throw new NotFoundException({
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Voucher not found.',
      });
    }

    const now = new Date();
    if (voucher.startsAt && voucher.startsAt <= now) {
      throw new UnprocessableEntityException({
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Only vouchers that have not started can be updated.',
      });
    }
    
    return this.voucherRepository.updateVoucher(voucherId, updateVoucherDto);
  }

  async deactivateVoucher(voucherId: string) {
    const voucher = await this.voucherRepository.findVoucherById(voucherId);
    if (!voucher) {
      throw new NotFoundException({
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Voucher not found.',
      });
    }

    if (voucher.status !== VoucherStatus.ACTIVE) {
      throw new UnprocessableEntityException({
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Only active vouchers can be deactivated.',
      });
    }

    return this.voucherRepository.deactivateVoucher(voucherId);
  }

  async validateVoucherForCheckout({
    userId,
    voucherCode,
    subtotal,
    cartItems,
    client,
  }: ValidateVoucherForCheckoutParams): Promise<ValidatedVoucherForCheckout> {
    const normalizedCode = this.normalizeVoucherCode(voucherCode);
    const voucher = await this.voucherRepository.findVoucherForCheckout(
      normalizedCode,
      client,
    );

    if (!voucher) {
      this.throwVoucherViolation('Voucher code is invalid.');
    }

    const now = new Date();

    if (voucher.status !== VoucherStatus.ACTIVE) {
      this.throwVoucherViolation('Voucher is not active.');
    }

    if (voucher.startsAt && voucher.startsAt > now) {
      this.throwVoucherViolation('Voucher has not started yet.');
    }

    if (voucher.expiresAt && voucher.expiresAt < now) {
      this.throwVoucherViolation('Voucher has expired.');
    }

    const minimumOrderAmount = this.toNumber(voucher.minimumOrderAmount);

    if (minimumOrderAmount > 0 && subtotal < minimumOrderAmount) {
      this.throwVoucherViolation(
        `Minimum order amount for this voucher is ${minimumOrderAmount}.`,
      );
    }

    const [globalRedemptionCount, userRedemptionCount] = await Promise.all([
      this.voucherRepository.countVoucherRedemptions(voucher.id, client),
      this.voucherRepository.countVoucherRedemptionsForUser(
        voucher.id,
        userId,
        client,
      ),
    ]);

    if (voucher.usageLimit && globalRedemptionCount >= voucher.usageLimit) {
      this.throwVoucherViolation('Voucher usage limit has been reached.');
    }

    if (voucher.perUserLimit && userRedemptionCount >= voucher.perUserLimit) {
      this.throwVoucherViolation(
        'Voucher usage limit for this user has been reached.',
      );
    }

    const eligibleAmount = this.calculateEligibleAmount(voucher, cartItems);

    if (eligibleAmount <= 0) {
      this.throwVoucherViolation('Voucher is not applicable to this cart.');
    }

    const discount = this.calculateDiscount(voucher, eligibleAmount);

    return {
      voucherId: voucher.id,
      voucherCode: normalizedCode,
      eligibleAmount,
      discount,
    };
  }

  createVoucherRedemption({
    userId,
    orderId,
    voucherId,
    discountAmount,
    client,
  }: CreateVoucherRedemptionParams) {
    return this.voucherRepository.createVoucherRedemption(
      {
        user: { connect: { id: userId } },
        order: { connect: { id: orderId } },
        voucher: { connect: { id: voucherId } },
        discountAmount,
      },
      client,
    );
  }

  private normalizeVoucherCode(voucherCode: string) {
    return voucherCode.trim().toUpperCase();
  }

  private calculateEligibleAmount(
    voucher: Awaited<ReturnType<VoucherRepository['findVoucherForCheckout']>>,
    cartItems: VoucherCheckoutCartItem[],
  ) {
    if (!voucher) {
      return 0;
    }

    if (voucher.scope === VoucherScope.ORDER) {
      return this.calculateItemsAmount(cartItems);
    }

    if (voucher.scope === VoucherScope.PRODUCT) {
      const productIds = new Set(
        voucher.products.map((product) => product.productId),
      );
      return this.calculateItemsAmount(
        cartItems.filter((item) => productIds.has(item.productId)),
      );
    }

    if (voucher.scope === VoucherScope.CATEGORY) {
      const categoryIds = new Set(
        voucher.categories.map((category) => category.categoryId),
      );
      return this.calculateItemsAmount(
        cartItems.filter(
          (item) => item.categoryId && categoryIds.has(item.categoryId),
        ),
      );
    }

    return 0;
  }

  private calculateItemsAmount(items: VoucherCheckoutCartItem[]) {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  private calculateDiscount(
    voucher: NonNullable<
      Awaited<ReturnType<VoucherRepository['findVoucherForCheckout']>>
    >,
    eligibleAmount: number,
  ) {
    const discountValue = this.toNumber(voucher.discountValue);
    const rawDiscount =
      voucher.discountType === DiscountType.PERCENT
        ? (eligibleAmount * discountValue) / 100
        : discountValue;

    const cappedDiscount =
      voucher.discountType === DiscountType.PERCENT &&
      voucher.maximumDiscountAmount
        ? Math.min(rawDiscount, this.toNumber(voucher.maximumDiscountAmount))
        : rawDiscount;

    const finalDiscount = Math.max(0, Math.min(cappedDiscount, eligibleAmount));

    if (finalDiscount <= 0) {
      this.throwVoucherViolation('Calculated discount is not valid.');
    }

    return finalDiscount;
  }

  private toNumber(value: unknown): number {
    if (value === null || value === undefined) {
      return 0;
    }

    return Number(value);
  }

  private throwVoucherViolation(message: string): never {
    throw new UnprocessableEntityException({
      code: 'BUSINESS_RULE_VIOLATION',
      message,
    });
  }

  async isVoucherAvailableForUser(
    voucherId: string,
    userId: string,
    client: DbClient = this.voucherRepository['databaseService'],
  ) {
    const voucher = await this.voucherRepository.findVoucherById(voucherId, client);

    if (!voucher) {
      throw new NotFoundException({
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Voucher not found.',
      });
    }

    if (voucher.status !== VoucherStatus.ACTIVE) {
      return false;
    }

    const voucherRedemptionCount = await this.voucherRepository.countVoucherRedemptions(voucherId, client);

    if (voucher.usageLimit && voucherRedemptionCount >= voucher.usageLimit) {
      return false;
    }

    const redemptionCount = await this.voucherRepository.countVoucherRedemptionsForUser(
      voucherId,
      userId,
      client,
    );

    if (voucher.perUserLimit && redemptionCount >= voucher.perUserLimit) {
      return false;
    }

    return true;
  }
}
