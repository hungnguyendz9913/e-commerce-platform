import { UnprocessableEntityException } from '@nestjs/common';
import {
  DiscountType,
  VoucherScope,
  VoucherStatus,
} from '@e-commerce-platform/api-contracts';
import { VoucherService } from './voucher.service';
import { VoucherRepository } from './voucher.repository';

function createVoucher(overrides: Record<string, unknown> = {}) {
  return {
    id: 'voucher-id',
    code: 'SALE10',
    discountType: DiscountType.PERCENT,
    discountValue: 10,
    minimumOrderAmount: null,
    maximumDiscountAmount: null,
    usageLimit: null,
    perUserLimit: null,
    startsAt: new Date('2026-01-01T00:00:00.000Z'),
    expiresAt: new Date('2026-12-31T23:59:59.000Z'),
    status: VoucherStatus.ACTIVE,
    scope: VoucherScope.ORDER,
    products: [],
    categories: [],
    ...overrides,
  };
}

function createCartItem(overrides: Record<string, unknown> = {}) {
  return {
    productId: 'product-id',
    categoryId: 'category-id',
    quantity: 2,
    unitPrice: 100000,
    ...overrides,
  };
}

function createService() {
  const voucherRepository = {
    findActiveVoucherForProduct: jest.fn(),
    findActiveVoucherForCategory: jest.fn(),
    createVoucher: jest.fn(),
    findAllVouchers: jest.fn(),
    findVoucherById: jest.fn(),
    findVoucherForCheckout: jest.fn(),
    countVoucherRedemptions: jest.fn(),
    countVoucherRedemptionsForUser: jest.fn(),
    createVoucherRedemption: jest.fn(),
    updateVoucher: jest.fn(),
    deactivateVoucher: jest.fn(),
  };

  voucherRepository.findVoucherForCheckout.mockResolvedValue(createVoucher());
  voucherRepository.countVoucherRedemptions.mockResolvedValue(0);
  voucherRepository.countVoucherRedemptionsForUser.mockResolvedValue(0);

  const service = new VoucherService(
    voucherRepository as unknown as VoucherRepository,
  );

  return { service, voucherRepository };
}

describe('VoucherService', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-17T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('normalizes voucher code and returns discount details', async () => {
    const { service, voucherRepository } = createService();

    await expect(
      service.validateVoucherForCheckout({
        userId: 'user-id',
        voucherCode: ' sale10 ',
        subtotal: 200000,
        cartItems: [createCartItem()],
      }),
    ).resolves.toEqual({
      voucherId: 'voucher-id',
      voucherCode: 'SALE10',
      eligibleAmount: 200000,
      discount: 20000,
    });

    expect(voucherRepository.findVoucherForCheckout).toHaveBeenCalledWith(
      'SALE10',
      undefined,
    );
  });

  it('rejects inactive, not-yet-started, and expired vouchers', async () => {
    const { service, voucherRepository } = createService();

    for (const voucher of [
      createVoucher({ status: VoucherStatus.INACTIVE }),
      createVoucher({ startsAt: new Date('2026-07-01T00:00:00.000Z') }),
      createVoucher({ expiresAt: new Date('2026-01-01T00:00:00.000Z') }),
    ]) {
      voucherRepository.findVoucherForCheckout.mockResolvedValueOnce(voucher);

      await expect(
        service.validateVoucherForCheckout({
          userId: 'user-id',
          voucherCode: 'SALE10',
          subtotal: 200000,
          cartItems: [createCartItem()],
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    }
  });

  it('rejects vouchers below minimum order and over usage limits', async () => {
    const { service, voucherRepository } = createService();

    voucherRepository.findVoucherForCheckout.mockResolvedValueOnce(
      createVoucher({ minimumOrderAmount: 300000 }),
    );
    await expect(
      service.validateVoucherForCheckout({
        userId: 'user-id',
        voucherCode: 'SALE10',
        subtotal: 200000,
        cartItems: [createCartItem()],
      }),
    ).rejects.toThrow(UnprocessableEntityException);

    voucherRepository.findVoucherForCheckout.mockResolvedValueOnce(
      createVoucher({ usageLimit: 1 }),
    );
    voucherRepository.countVoucherRedemptions.mockResolvedValueOnce(1);
    await expect(
      service.validateVoucherForCheckout({
        userId: 'user-id',
        voucherCode: 'SALE10',
        subtotal: 200000,
        cartItems: [createCartItem()],
      }),
    ).rejects.toThrow(UnprocessableEntityException);

    voucherRepository.findVoucherForCheckout.mockResolvedValueOnce(
      createVoucher({ perUserLimit: 1 }),
    );
    voucherRepository.countVoucherRedemptions.mockResolvedValueOnce(0);
    voucherRepository.countVoucherRedemptionsForUser.mockResolvedValueOnce(1);
    await expect(
      service.validateVoucherForCheckout({
        userId: 'user-id',
        voucherCode: 'SALE10',
        subtotal: 200000,
        cartItems: [createCartItem()],
      }),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('calculates scoped eligibility for product and category vouchers', async () => {
    const { service, voucherRepository } = createService();
    const cartItems = [
      createCartItem({ productId: 'matched-product', categoryId: 'cat-a' }),
      createCartItem({
        productId: 'other-product',
        categoryId: 'matched-category',
        unitPrice: 50000,
      }),
    ];

    voucherRepository.findVoucherForCheckout.mockResolvedValueOnce(
      createVoucher({
        scope: VoucherScope.PRODUCT,
        products: [{ productId: 'matched-product' }],
      }),
    );

    await expect(
      service.validateVoucherForCheckout({
        userId: 'user-id',
        voucherCode: 'SALE10',
        subtotal: 300000,
        cartItems,
      }),
    ).resolves.toMatchObject({
      eligibleAmount: 200000,
      discount: 20000,
    });

    voucherRepository.findVoucherForCheckout.mockResolvedValueOnce(
      createVoucher({
        scope: VoucherScope.CATEGORY,
        categories: [{ categoryId: 'matched-category' }],
      }),
    );

    await expect(
      service.validateVoucherForCheckout({
        userId: 'user-id',
        voucherCode: 'SALE10',
        subtotal: 300000,
        cartItems,
      }),
    ).resolves.toMatchObject({
      eligibleAmount: 100000,
      discount: 10000,
    });
  });

  it('rejects scoped vouchers with no eligible cart items', async () => {
    const { service, voucherRepository } = createService();
    voucherRepository.findVoucherForCheckout.mockResolvedValue(
      createVoucher({
        scope: VoucherScope.PRODUCT,
        products: [{ productId: 'another-product' }],
      }),
    );

    await expect(
      service.validateVoucherForCheckout({
        userId: 'user-id',
        voucherCode: 'SALE10',
        subtotal: 200000,
        cartItems: [createCartItem()],
      }),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('caps percent discounts and fixed discounts by eligible amount', async () => {
    const { service, voucherRepository } = createService();

    voucherRepository.findVoucherForCheckout.mockResolvedValueOnce(
      createVoucher({
        discountValue: 50,
        maximumDiscountAmount: 30000,
      }),
    );

    await expect(
      service.validateVoucherForCheckout({
        userId: 'user-id',
        voucherCode: 'SALE10',
        subtotal: 200000,
        cartItems: [createCartItem()],
      }),
    ).resolves.toMatchObject({ discount: 30000 });

    voucherRepository.findVoucherForCheckout.mockResolvedValueOnce(
      createVoucher({
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 500000,
      }),
    );

    await expect(
      service.validateVoucherForCheckout({
        userId: 'user-id',
        voucherCode: 'SALE10',
        subtotal: 200000,
        cartItems: [createCartItem()],
      }),
    ).resolves.toMatchObject({ discount: 200000 });
  });

  it('creates voucher redemption with the transaction client', async () => {
    const { service, voucherRepository } = createService();
    const tx = { id: 'tx' };
    voucherRepository.createVoucherRedemption.mockResolvedValue({
      id: 'redemption-id',
    });

    await expect(
      service.createVoucherRedemption({
        userId: 'user-id',
        orderId: 'order-id',
        voucherId: 'voucher-id',
        discountAmount: 30000,
        client: tx as never,
      }),
    ).resolves.toEqual({ id: 'redemption-id' });

    expect(voucherRepository.createVoucherRedemption).toHaveBeenCalledWith(
      {
        user: { connect: { id: 'user-id' } },
        order: { connect: { id: 'order-id' } },
        voucher: { connect: { id: 'voucher-id' } },
        discountAmount: 30000,
      },
      tx,
    );
  });
});
