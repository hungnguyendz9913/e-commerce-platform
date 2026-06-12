import { DatabaseService, Prisma } from "@e-commerce-platform/database";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CartRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  getMyActiveCart(userId: string) {
    return this.databaseService.cart.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        items: true,
      }
    });
  }

  createNewCartForUser(userId: string) {
    return this.databaseService.cart.create({
      data: {
        userId,
      },
      select: {
        id: true,
        items: true
      }
    });
  }

  findItemByCardIdAndProductId(cartId: string, productId: string) {
    return this.databaseService.cartItem.findFirst({
      where: {
        cartId,
        productId
      }
    });
  }

  async createCartItem(data: {
    cartId: string;
    productId: string;
    quantity: number;
    unitPriceSnapshot: Prisma.Decimal;
  }) {
    return this.databaseService.cartItem.create({
      data,
    });
  }

  async updateCartItemQuantity(cartItemId: string, quantity: number, unitPriceSnapshot: Prisma.Decimal) {
    return this.databaseService.cartItem.update({
      where: {
        id: cartItemId,
      },
      data: {
        quantity,
        unitPriceSnapshot,
      },
    });
  }

  async findCartItemByIdAndCartId(itemId: string, cartId: string) {
    return this.databaseService.cartItem.findFirst({
      where: {
        id: itemId,
        cartId
      }
    });
  }

  async deleteCartItem(itemId: string) {
    return this.databaseService.cartItem.delete({
      where: {
        id: itemId,
      },
    });
  }

  async deleteCartItemsByCartId(cartId: string) {
    return this.databaseService.cartItem.deleteMany({
      where: {
        cartId,
      },
    });
  }
}
