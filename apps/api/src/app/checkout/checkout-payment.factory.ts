import { Injectable } from '@nestjs/common';
import { CheckoutPaymentProvider } from '@e-commerce-platform/api-contracts';
import { Prisma } from '@e-commerce-platform/database';

@Injectable()
export class CheckoutPaymentFactory {
  buildPaymentData(
    paymentProvider: CheckoutPaymentProvider,
    orderId: string,
    amount: number,
  ): Prisma.PaymentCreateArgs['data'] | null {
    if (paymentProvider === CheckoutPaymentProvider.COD) {
      return null;
    }

    return {
      order: { connect: { id: orderId } },
      provider: this.getProvider(paymentProvider),
      method: 'WALLET',
      status: 'PENDING',
      amount,
      currency: 'VND',
    };
  }

  buildPaymentUrl(paymentProvider: CheckoutPaymentProvider, orderId: string) {
    if (paymentProvider === CheckoutPaymentProvider.MOMO) {
      return `https://mock.momo.vn/pay?orderId=${orderId}`;
    }

    if (paymentProvider === CheckoutPaymentProvider.VNPAY) {
      return `https://mock.vnpay.vn/pay?orderId=${orderId}`;
    }

    return undefined;
  }

  private getProvider(paymentProvider: CheckoutPaymentProvider) {
    if (paymentProvider === CheckoutPaymentProvider.MOMO) {
      return 'MOMO' as const;
    }

    return 'VNPAY' as const;
  }
}
