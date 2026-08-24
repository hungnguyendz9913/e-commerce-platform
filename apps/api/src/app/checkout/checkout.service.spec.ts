import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TransactionService } from '@e-commerce-platform/database';
import { CheckoutPaymentProvider } from '@e-commerce-platform/api-contracts';
import { InventoryService } from '../inventory/inventory.service';
import { CheckoutRepository } from './checkout.repository';
import { CheckoutService } from './checkout.service';
import { CheckoutCartValidator } from './checkout-cart.validator';
import { CheckoutTotalsService } from './checkout-totals.service';
import { CheckoutOrderFactory } from './checkout-order.factory';
import { CheckoutPaymentFactory } from './checkout-payment.factory';
import { VoucherService } from '../vouchers/voucher.service';

function createProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-id',
    categoryId: 'category-id',
    name: 'Test Product',
    sku: 'SKU-001',
    price: 100000,
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    category: { id: 'category-id', name: 'Category' },
    inventoryItem: { stockQuantity: 10, reservedQuantity: 0 },
    ...overrides,
  };
}

function createCartItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cart-item-id',
    cartId: 'cart-id',
    productId: 'product-id',
    quantity: 2,
    unitPriceSnapshot: 100000,
    product: createProduct(),
    ...overrides,
  };
}

function createCart(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cart-id',
    userId: 'user-id',
    status: 'ACTIVE',
    items: [createCartItem()],
    ...overrides,
  };
}

function createCheckoutDto(
  paymentProvider = CheckoutPaymentProvider.COD,
  voucherCode?: string,
) {
  return {
    deliveryInfo: {
      recipientName: 'John Doe',
      recipientPhone: '0901234567',
      shippingAddress: '123 Test St, HCMC',
    },
    paymentProvider,
    voucherCode,
  };
}

function createService() {
  const tx = { id: 'tx' };
  const checkoutRepository = {
    findActiveCartWithItems: jest.fn(),
    createOrder: jest.fn(),
    createOrderItems: jest.fn(),
    claimCartForCheckout: jest.fn().mockResolvedValue({ count: 1 }),
    createPayment: jest.fn(),
  };
  const transactionService = {
    runSerializable: jest.fn((cb) => cb(tx)),
  };
  const inventoryService = {
    deductStockForCheckout: jest.fn(),
  };
  const voucherService = {
    validateVoucherForCheckout: jest.fn(),
    isVoucherAvailableForUser: jest.fn().mockResolvedValue(true),
    createVoucherRedemption: jest.fn(),
  };

  const checkoutCartValidator = new CheckoutCartValidator();
  const checkoutTotalsService = new CheckoutTotalsService(
    voucherService as unknown as VoucherService,
  );
  const checkoutOrderFactory = new CheckoutOrderFactory();
  const checkoutPaymentFactory = new CheckoutPaymentFactory();

  const service = new CheckoutService(
    checkoutRepository as unknown as CheckoutRepository,
    transactionService as unknown as TransactionService,
    inventoryService as unknown as InventoryService,
    checkoutCartValidator,
    checkoutTotalsService,
    checkoutOrderFactory,
    checkoutPaymentFactory,
    voucherService as unknown as VoucherService,
  );

  return {
    service,
    checkoutRepository,
    transactionService,
    inventoryService,
    voucherService,
    tx,
  };
}

describe('CheckoutService', () => {
  describe('validateCheckout', () => {
    it('returns checkout summary for a valid cart', async () => {
      const { service, checkoutRepository, voucherService } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart(),
      );

      const result = await service.validateCheckout(
        'user-id',
        createCheckoutDto(),
      );

      expect(result).toMatchObject({
        subtotal: 200000,
        discount: 0,
        shippingFee: 30000,
        total: 230000,
      });
      expect(result.items).toHaveLength(1);
      expect(voucherService.validateVoucherForCheckout).not.toHaveBeenCalled();
    });

    it('applies voucher discount during checkout validation', async () => {
      const { service, checkoutRepository, voucherService } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart(),
      );
      voucherService.validateVoucherForCheckout.mockResolvedValue({
        voucherId: 'voucher-id',
        voucherCode: 'SALE10',
        eligibleAmount: 200000,
        discount: 20000,
      });

      const result = await service.validateCheckout(
        'user-id',
        createCheckoutDto(CheckoutPaymentProvider.COD, ' sale10 '),
      );

      expect(result).toMatchObject({
        subtotal: 200000,
        discount: 20000,
        shippingFee: 30000,
        total: 210000,
      });
      expect(voucherService.validateVoucherForCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-id',
          voucherCode: ' sale10 ',
          subtotal: 200000,
          cartItems: [
            {
              productId: 'product-id',
              categoryId: 'category-id',
              quantity: 2,
              unitPrice: 100000,
            },
          ],
        }),
      );
    });

    it('throws when cart is empty or invalid', async () => {
      const { service, checkoutRepository } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValueOnce(null);

      await expect(
        service.validateCheckout('user-id', createCheckoutDto()),
      ).rejects.toThrow(UnprocessableEntityException);

      checkoutRepository.findActiveCartWithItems.mockResolvedValueOnce(
        createCart({
          items: [
            createCartItem({
              product: createProduct({ status: 'INACTIVE' }),
            }),
          ],
        }),
      );

      await expect(
        service.validateCheckout('user-id', createCheckoutDto()),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('applyVoucher', () => {
    it('uses the same total calculation path as checkout validation', async () => {
      const { service, checkoutRepository, voucherService } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart(),
      );
      voucherService.validateVoucherForCheckout.mockResolvedValue({
        voucherId: 'voucher-id',
        voucherCode: 'SALE10',
        eligibleAmount: 200000,
        discount: 20000,
      });

      const applyResult = await service.applyVoucher('user-id', {
        voucherCode: ' sale10 ',
        deliveryInfo: createCheckoutDto().deliveryInfo,
      });
      const validateResult = await service.validateCheckout(
        'user-id',
        createCheckoutDto(CheckoutPaymentProvider.COD, ' sale10 '),
      );

      expect(applyResult).toEqual({
        voucherCode: 'SALE10',
        subtotal: validateResult.subtotal,
        discount: validateResult.discount,
        shippingFee: validateResult.shippingFee,
        total: validateResult.total,
      });
    });
  });

  describe('createOrderFromCart', () => {
    it('creates order and returns it for COD', async () => {
      const {
        service,
        checkoutRepository,
        transactionService,
        inventoryService,
        tx,
      } = createService();
      const order = {
        id: 'order-id',
        orderNumber: 'ORD-123',
        totalAmount: 230000,
      };

      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart(),
      );
      checkoutRepository.createOrder.mockResolvedValue(order);
      checkoutRepository.createOrderItems.mockResolvedValue({ count: 1 });
      const result = await service.createOrderFromCart(
        'user-id',
        createCheckoutDto(),
      );

      expect(result).toEqual({ order });
      expect(transactionService.runSerializable).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(checkoutRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientName: 'John Doe',
          subtotalAmount: 200000,
          shippingFee: 30000,
          totalAmount: 230000,
        }),
        tx,
      );
      expect(checkoutRepository.createOrderItems).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            productNameSnapshot: 'Test Product',
            skuSnapshot: 'SKU-001',
            quantity: 2,
          }),
        ]),
        tx,
      );
      expect(inventoryService.deductStockForCheckout).toHaveBeenCalledWith(
        'product-id',
        2,
        'order-id',
        tx,
      );
      expect(checkoutRepository.claimCartForCheckout).toHaveBeenCalledWith(
        'cart-id',
        tx,
      );
      expect(checkoutRepository.createPayment).not.toHaveBeenCalled();
    });

    it('creates payment record and returns paymentUrl for MOMO and VNPAY', async () => {
      for (const paymentProvider of [
        CheckoutPaymentProvider.MOMO,
        CheckoutPaymentProvider.VNPAY,
      ]) {
        const { service, checkoutRepository } = createService();
        const order = {
          id: 'order-id',
          orderNumber: 'ORD-123',
          totalAmount: 230000,
        };
        const payment = { id: 'payment-id', status: 'PENDING' };

        checkoutRepository.findActiveCartWithItems.mockResolvedValue(
          createCart(),
        );
        checkoutRepository.createOrder.mockResolvedValue(order);
        checkoutRepository.createOrderItems.mockResolvedValue({ count: 1 });
        checkoutRepository.createPayment.mockResolvedValue(payment);

        const result = await service.createOrderFromCart(
          'user-id',
          createCheckoutDto(paymentProvider),
        );

        expect(result).toMatchObject({
          order,
          payment,
          paymentUrl: expect.stringContaining(
            paymentProvider === CheckoutPaymentProvider.MOMO
              ? 'mock.momo.vn'
              : 'mock.vnpay.vn',
          ),
        });
        expect(checkoutRepository.createPayment).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: paymentProvider,
            status: 'PENDING',
            amount: 230000,
          }),
          expect.anything(),
        );
      }
    });

    it('recalculates voucher totals and creates redemption inside the transaction', async () => {
      const { service, checkoutRepository, voucherService, tx } =
        createService();
      const order = {
        id: 'order-id',
        orderNumber: 'ORD-123',
        totalAmount: 210000,
      };

      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart(),
      );
      checkoutRepository.createOrder.mockResolvedValue(order);
      checkoutRepository.createOrderItems.mockResolvedValue({ count: 1 });
      voucherService.validateVoucherForCheckout.mockResolvedValue({
        voucherId: 'voucher-id',
        voucherCode: 'SALE10',
        eligibleAmount: 200000,
        discount: 20000,
      });

      await service.createOrderFromCart(
        'user-id',
        createCheckoutDto(CheckoutPaymentProvider.COD, 'SALE10'),
      );

      expect(voucherService.validateVoucherForCheckout).toHaveBeenCalledWith(
        expect.objectContaining({ client: tx, subtotal: 200000 }),
      );
      expect(checkoutRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          discountAmount: 20000,
          totalAmount: 210000,
          voucher: { connect: { id: 'voucher-id' } },
        }),
        tx,
      );
      expect(voucherService.createVoucherRedemption).toHaveBeenCalledWith({
        userId: 'user-id',
        orderId: 'order-id',
        voucherId: 'voucher-id',
        discountAmount: 20000,
        client: tx,
      });
    });

    it('uses the current product price for totals, vouchers, and order item snapshots', async () => {
      const { service, checkoutRepository, voucherService, tx } =
        createService();
      const order = {
        id: 'order-id',
        orderNumber: 'ORD-123',
        totalAmount: 246000,
      };
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart({
          items: [
            createCartItem({
              unitPriceSnapshot: 100000,
              product: createProduct({ price: 120000 }),
            }),
          ],
        }),
      );
      checkoutRepository.createOrder.mockResolvedValue(order);
      checkoutRepository.createOrderItems.mockResolvedValue({ count: 1 });
      voucherService.validateVoucherForCheckout.mockResolvedValue({
        voucherId: 'voucher-id',
        voucherCode: 'SALE10',
        eligibleAmount: 240000,
        discount: 24000,
      });

      await service.createOrderFromCart(
        'user-id',
        createCheckoutDto(CheckoutPaymentProvider.COD, 'SALE10'),
      );

      expect(voucherService.validateVoucherForCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotal: 240000,
          cartItems: [
            expect.objectContaining({
              unitPrice: 120000,
              quantity: 2,
            }),
          ],
        }),
      );
      expect(checkoutRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotalAmount: 240000,
          discountAmount: 24000,
          totalAmount: 246000,
        }),
        tx,
      );
      expect(checkoutRepository.createOrderItems).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            unitPriceSnapshot: 120000,
            totalPrice: 240000,
          }),
        ],
        tx,
      );
    });

    it('propagates stock deduction failure after claiming the cart', async () => {
      const { service, checkoutRepository, inventoryService } = createService();
      const order = {
        id: 'order-id',
        orderNumber: 'ORD-123',
        totalAmount: 230000,
      };

      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart(),
      );
      checkoutRepository.createOrder.mockResolvedValue(order);
      checkoutRepository.createOrderItems.mockResolvedValue({ count: 1 });
      inventoryService.deductStockForCheckout.mockRejectedValue(
        new UnprocessableEntityException({
          code: 'BUSINESS_RULE_VIOLATION',
          message: 'Insufficient stock',
        }),
      );

      await expect(
        service.createOrderFromCart('user-id', createCheckoutDto()),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(checkoutRepository.claimCartForCheckout).toHaveBeenCalledWith(
        'cart-id',
        expect.anything(),
      );
    });

    it('returns a business-rule error when the voucher limit is reached', async () => {
      const { service, checkoutRepository, voucherService } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart(),
      );
      checkoutRepository.createOrder.mockResolvedValue({ id: 'order-id' });
      checkoutRepository.createOrderItems.mockResolvedValue({ count: 1 });
      voucherService.validateVoucherForCheckout.mockResolvedValue({
        voucherId: 'voucher-id',
        voucherCode: 'SALE10',
        eligibleAmount: 200000,
        discount: 20000,
      });
      voucherService.isVoucherAvailableForUser.mockResolvedValue(false);

      await expect(
        service.createOrderFromCart(
          'user-id',
          createCheckoutDto(CheckoutPaymentProvider.COD, 'SALE10'),
        ),
      ).rejects.toMatchObject({
        status: 422,
        response: {
          code: 'BUSINESS_RULE_VIOLATION',
          message: 'Voucher usage limit for this user has been reached.',
        },
      });

      expect(voucherService.createVoucherRedemption).not.toHaveBeenCalled();
      expect(checkoutRepository.createPayment).not.toHaveBeenCalled();
    });

    it('propagates voucher redemption failure after claiming the cart', async () => {
      const { service, checkoutRepository, voucherService } = createService();
      const order = {
        id: 'order-id',
        orderNumber: 'ORD-123',
        totalAmount: 210000,
      };

      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart(),
      );
      checkoutRepository.createOrder.mockResolvedValue(order);
      checkoutRepository.createOrderItems.mockResolvedValue({ count: 1 });
      voucherService.validateVoucherForCheckout.mockResolvedValue({
        voucherId: 'voucher-id',
        voucherCode: 'SALE10',
        eligibleAmount: 200000,
        discount: 20000,
      });
      voucherService.createVoucherRedemption.mockRejectedValue(
        new Error('redemption failed'),
      );

      await expect(
        service.createOrderFromCart(
          'user-id',
          createCheckoutDto(CheckoutPaymentProvider.COD, 'SALE10'),
        ),
      ).rejects.toThrow('redemption failed');
      expect(checkoutRepository.claimCartForCheckout).toHaveBeenCalledWith(
        'cart-id',
        expect.anything(),
      );
    });

    it('rejects checkout when another request already claimed the cart', async () => {
      const { service, checkoutRepository, inventoryService, tx } =
        createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart(),
      );
      checkoutRepository.claimCartForCheckout.mockResolvedValue({ count: 0 });

      await expect(
        service.createOrderFromCart('user-id', createCheckoutDto()),
      ).rejects.toThrow(ConflictException);

      expect(checkoutRepository.claimCartForCheckout).toHaveBeenCalledWith(
        'cart-id',
        tx,
      );
      expect(checkoutRepository.createOrder).not.toHaveBeenCalled();
      expect(checkoutRepository.createOrderItems).not.toHaveBeenCalled();
      expect(inventoryService.deductStockForCheckout).not.toHaveBeenCalled();
    });
  });
});
