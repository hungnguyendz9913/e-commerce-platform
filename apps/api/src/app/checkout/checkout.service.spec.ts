import { UnprocessableEntityException } from '@nestjs/common';
import { TransactionService } from '@e-commerce-platform/database';
import { CheckoutPaymentProvider } from '@e-commerce-platform/api-contracts';
import { InventoryService } from '../inventory/inventory.service';
import { CheckoutRepository } from './checkout.repository';
import { CheckoutService } from './checkout.service';

function createProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-id',
    name: 'Test Product',
    sku: 'SKU-001',
    price: 100000,
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
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

function createCheckoutDto(paymentProvider = CheckoutPaymentProvider.COD) {
  return {
    deliveryInfo: {
      recipientName: 'John Doe',
      recipientPhone: '0901234567',
      shippingAddress: '123 Test St, HCMC',
    },
    paymentProvider,
  };
}

function createService() {
  const tx = { id: 'tx' };
  const checkoutRepository = {
    findActiveCartWithItems: jest.fn(),
    createOrder: jest.fn(),
    createOrderItems: jest.fn(),
    markCartCheckedOut: jest.fn(),
    createPayment: jest.fn(),
  };
  const transactionService = {
    run: jest.fn((cb) => cb(tx)),
  };
  const inventoryService = {
    deductStockForCheckout: jest.fn(),
  };

  const service = new CheckoutService(
    checkoutRepository as unknown as CheckoutRepository,
    transactionService as unknown as TransactionService,
    inventoryService as unknown as InventoryService,
  );

  return { service, checkoutRepository, transactionService, inventoryService, tx };
}

describe('CheckoutService', () => {
  describe('validateCheckout', () => {
    it('returns checkout summary for a valid cart', async () => {
      const { service, checkoutRepository } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(createCart());

      const result = await service.validateCheckout('user-id', createCheckoutDto());

      expect(result).toMatchObject({
        subtotal: 200000,
        discount: 0,
        shippingFee: 30000,
        total: 230000,
      });
      expect(result.items).toHaveLength(1);
    });

    it('throws when cart is null', async () => {
      const { service, checkoutRepository } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(null);

      await expect(
        service.validateCheckout('user-id', createCheckoutDto()),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when cart has no items', async () => {
      const { service, checkoutRepository } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart({ items: [] }),
      );

      await expect(
        service.validateCheckout('user-id', createCheckoutDto()),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when product is inactive', async () => {
      const { service, checkoutRepository } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart({ items: [createCartItem({ product: createProduct({ status: 'INACTIVE' }) })] }),
      );

      await expect(
        service.validateCheckout('user-id', createCheckoutDto()),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when product is not approved', async () => {
      const { service, checkoutRepository } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart({ items: [createCartItem({ product: createProduct({ approvalStatus: 'PENDING' }) })] }),
      );

      await expect(
        service.validateCheckout('user-id', createCheckoutDto()),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when stock is insufficient', async () => {
      const { service, checkoutRepository } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(
        createCart({
          items: [createCartItem({
            quantity: 20,
            product: createProduct({ inventoryItem: { stockQuantity: 5, reservedQuantity: 0 } }),
          })],
        }),
      );

      await expect(
        service.validateCheckout('user-id', createCheckoutDto()),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('createOrderFromCart', () => {
    it('creates order and returns it for COD', async () => {
      const { service, checkoutRepository, inventoryService, tx } = createService();
      const order = { id: 'order-id', orderNumber: 'ORD-123', totalAmount: 230000 };

      checkoutRepository.findActiveCartWithItems.mockResolvedValue(createCart());
      checkoutRepository.createOrder.mockResolvedValue(order);
      checkoutRepository.createOrderItems.mockResolvedValue({ count: 1 });
      checkoutRepository.markCartCheckedOut.mockResolvedValue({});

      const result = await service.createOrderFromCart('user-id', createCheckoutDto());

      expect(result).toEqual({ order });
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
        'product-id', 2, 'order-id', tx,
      );
      expect(checkoutRepository.markCartCheckedOut).toHaveBeenCalledWith('cart-id', tx);
      expect(checkoutRepository.createPayment).not.toHaveBeenCalled();
    });

    it('creates payment record and returns paymentUrl for MOMO', async () => {
      const { service, checkoutRepository } = createService();
      const order = { id: 'order-id', orderNumber: 'ORD-123', totalAmount: 230000 };
      const payment = { id: 'payment-id', status: 'PENDING' };

      checkoutRepository.findActiveCartWithItems.mockResolvedValue(createCart());
      checkoutRepository.createOrder.mockResolvedValue(order);
      checkoutRepository.createOrderItems.mockResolvedValue({ count: 1 });
      checkoutRepository.markCartCheckedOut.mockResolvedValue({});
      checkoutRepository.createPayment.mockResolvedValue(payment);

      const result = await service.createOrderFromCart(
        'user-id',
        createCheckoutDto(CheckoutPaymentProvider.MOMO),
      );

      expect(result).toMatchObject({ order, payment, paymentUrl: expect.stringContaining('mock.momo.vn') });
      expect(checkoutRepository.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'MOMO', status: 'PENDING', amount: 230000 }),
        expect.anything(),
      );
    });

    it('creates payment record and returns paymentUrl for VNPAY', async () => {
      const { service, checkoutRepository } = createService();
      const order = { id: 'order-id', orderNumber: 'ORD-123', totalAmount: 230000 };
      const payment = { id: 'payment-id', status: 'PENDING' };

      checkoutRepository.findActiveCartWithItems.mockResolvedValue(createCart());
      checkoutRepository.createOrder.mockResolvedValue(order);
      checkoutRepository.createOrderItems.mockResolvedValue({ count: 1 });
      checkoutRepository.markCartCheckedOut.mockResolvedValue({});
      checkoutRepository.createPayment.mockResolvedValue(payment);

      const result = await service.createOrderFromCart(
        'user-id',
        createCheckoutDto(CheckoutPaymentProvider.VNPAY),
      );

      expect(result).toMatchObject({ paymentUrl: expect.stringContaining('mock.vnpay.vn') });
    });

    it('throws when cart is empty', async () => {
      const { service, checkoutRepository } = createService();
      checkoutRepository.findActiveCartWithItems.mockResolvedValue(null);

      await expect(
        service.createOrderFromCart('user-id', createCheckoutDto()),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(checkoutRepository.createOrder).not.toHaveBeenCalled();
    });

    it('propagates stock deduction failure and does not mark cart checked out', async () => {
      const { service, checkoutRepository, inventoryService } = createService();
      const order = { id: 'order-id', orderNumber: 'ORD-123', totalAmount: 230000 };

      checkoutRepository.findActiveCartWithItems.mockResolvedValue(createCart());
      checkoutRepository.createOrder.mockResolvedValue(order);
      checkoutRepository.createOrderItems.mockResolvedValue({ count: 1 });
      inventoryService.deductStockForCheckout.mockRejectedValue(
        new UnprocessableEntityException({ code: 'BUSINESS_RULE_VIOLATION', message: 'Insufficient stock' }),
      );

      await expect(
        service.createOrderFromCart('user-id', createCheckoutDto()),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(checkoutRepository.markCartCheckedOut).not.toHaveBeenCalled();
    });
  });
});
