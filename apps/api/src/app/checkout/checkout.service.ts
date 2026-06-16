import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TransactionService } from '@e-commerce-platform/database';
import {
  ApplyVoucherDto,
  CheckoutDto,
  CheckoutPaymentProvider,
  DeliveryInfoDto,
} from '@e-commerce-platform/api-contracts';
import { CheckoutRepository } from './checkout.repository';
import { InventoryService } from '../inventory/inventory.service';

const SHIPPING_FEE = 30000; // 30,000 VND flat rate

type CartWithItems = NonNullable<
  Awaited<ReturnType<CheckoutRepository['findActiveCartWithItems']>>
>;

type CartItem = CartWithItems['items'][number];

@Injectable()
export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly transactionService: TransactionService,
    private readonly inventoryService: InventoryService,
  ) {}

  async validateCheckout(userId: string, dto: CheckoutDto) {
    const cart = await this.checkoutRepository.findActiveCartWithItems(userId);
    this.assertCartNotEmpty(cart);
    this.assertCartItemsValid(cart!.items);
    return this.buildCheckoutSummary(cart!.items, dto.voucherCode);
  }

  async applyVoucher(userId: string, dto: ApplyVoucherDto) {
    const cart = await this.checkoutRepository.findActiveCartWithItems(userId);
    this.assertCartNotEmpty(cart);

    const subtotal = this.calcSubtotal(cart!.items);
    // Voucher validation is deferred to VouchersService integration.
    // For now, return totals with zero discount.
    const discount = 0;
    const total = subtotal - discount + SHIPPING_FEE;

    return {
      voucherCode: dto.voucherCode,
      subtotal,
      discount,
      shippingFee: SHIPPING_FEE,
      total,
    };
  }

  async createOrderFromCart(userId: string, dto: CheckoutDto) {
    return this.transactionService.run(async (tx) => {
      const cart = await this.checkoutRepository.findActiveCartWithItems(
        userId,
        tx,
      );
      this.assertCartNotEmpty(cart);
      this.assertCartItemsValid(cart!.items);

      const { subtotal, discount, total } = this.buildCheckoutSummary(
        cart!.items,
        dto.voucherCode,
      );

      const orderNumber = this.generateOrderNumber();

      const order = await this.checkoutRepository.createOrder(
        {
          user: { connect: { id: userId } },
          orderNumber,
          subtotalAmount: subtotal,
          discountAmount: discount,
          shippingFee: SHIPPING_FEE,
          taxAmount: 0,
          totalAmount: total,
          recipientName: dto.deliveryInfo.recipientName,
          recipientPhone: dto.deliveryInfo.recipientPhone,
          shippingAddress: dto.deliveryInfo.shippingAddress,
        },
        tx,
      );

      const orderItems = cart!.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productNameSnapshot: item.product.name,
        skuSnapshot: item.product.sku,
        unitPriceSnapshot: item.unitPriceSnapshot,
        quantity: item.quantity,
        totalPrice:
          Number(item.unitPriceSnapshot) * item.quantity,
      }));

      await this.checkoutRepository.createOrderItems(orderItems, tx);

      for (const item of cart!.items) {
        await this.inventoryService.deductStockForCheckout(
          item.productId,
          item.quantity,
          order.id,
          tx,
        );
      }

      await this.checkoutRepository.markCartCheckedOut(cart!.id, tx);

      if (dto.paymentProvider === CheckoutPaymentProvider.COD) {
        return { order };
      }

      const providerMap = {
        [CheckoutPaymentProvider.MOMO]: {
          provider: 'MOMO' as const,
          mockUrl: `https://mock.momo.vn/pay?orderId=${order.id}`,
        },
        [CheckoutPaymentProvider.VNPAY]: {
          provider: 'VNPAY' as const,
          mockUrl: `https://mock.vnpay.vn/pay?orderId=${order.id}`,
        },
      };

      const providerConfig = providerMap[dto.paymentProvider];

      const payment = await this.checkoutRepository.createPayment(
        {
          order: { connect: { id: order.id } },
          provider: providerConfig.provider,
          method: 'WALLET',
          status: 'PENDING',
          amount: total,
          currency: 'VND',
        },
        tx,
      );

      return {
        order,
        payment,
        paymentUrl: providerConfig.mockUrl,
      };
    });
  }

  // --- Private helpers ---

  private assertCartNotEmpty(
    cart: CartWithItems | null,
  ): asserts cart is CartWithItems {
    if (!cart || cart.items.length === 0) {
      throw new UnprocessableEntityException({
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Cart is empty or no active cart found.',
      });
    }
  }

  private assertCartItemsValid(items: CartItem[]) {
    for (const item of items) {
      const product = item.product;

      if (product.status !== 'ACTIVE' || product.approvalStatus !== 'APPROVED') {
        throw new UnprocessableEntityException({
          code: 'BUSINESS_RULE_VIOLATION',
          message: `Product "${product.name}" is no longer available.`,
        });
      }

      if (!product.inventoryItem) {
        throw new UnprocessableEntityException({
          code: 'BUSINESS_RULE_VIOLATION',
          message: `Inventory not found for product "${product.name}".`,
        });
      }

      const available =
        product.inventoryItem.stockQuantity -
        product.inventoryItem.reservedQuantity;

      if (available < item.quantity) {
        throw new UnprocessableEntityException({
          code: 'BUSINESS_RULE_VIOLATION',
          message: `Insufficient stock for product "${product.name}". Available: ${available}, requested: ${item.quantity}.`,
        });
      }
    }
  }

  private calcSubtotal(items: CartItem[]): number {
    return items.reduce(
      (sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity,
      0,
    );
  }

  private buildCheckoutSummary(items: CartItem[], _voucherCode?: string) {
    const subtotal = this.calcSubtotal(items);
    // Voucher discount deferred until VouchersService integration
    const discount = 0;
    const total = subtotal - discount + SHIPPING_FEE;

    return {
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPriceSnapshot),
        totalPrice: Number(item.unitPriceSnapshot) * item.quantity,
      })),
      subtotal,
      discount,
      shippingFee: SHIPPING_FEE,
      total,
    };
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
  }
}