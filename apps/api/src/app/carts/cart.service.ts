import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import {
  AddItemToCartDto,
  UpdateCartItemQuantityDto,
} from '@e-commerce-platform/api-contracts';
import { ProductsService } from '../products/products.service';
import { prismaError, PrismaErrorCode } from '@e-commerce-platform/utils';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productService: ProductsService,
  ) {}

  async getMyActiveCart(userId: string) {
    return this.cartRepository.getMyActiveCart(userId);
  }

  async addItemToCart(userId: string, addItemToCartDto: AddItemToCartDto) {
    const quantity: number = addItemToCartDto.quantity ?? 1;
    const myCart = await this.getOrCreateActiveCart(userId);

    const product = await this.productService.findProductForCart(
      addItemToCartDto.productId,
    );
    if (!product) {
      throw new NotFoundException('Product not found!');
    }

    if (!product.inventoryItem) {
      throw new UnprocessableEntityException('Product inventory not found');
    }

    const availableQuantity =
      product.inventoryItem.stockQuantity -
      product.inventoryItem.reservedQuantity;

    if (availableQuantity <= 0) {
      throw new UnprocessableEntityException('Product is out of stock!');
    }

    const existingCartItem =
      await this.cartRepository.findItemByCardIdAndProductId(
        myCart.id,
        product.id,
      );
    if (existingCartItem) {
      return this.incrementCartItem(
        existingCartItem.id,
        myCart.id,
        quantity,
        availableQuantity,
        product.price,
      );
    }

    if (quantity > availableQuantity) {
      throw new UnprocessableEntityException(
        'Requested quantity exceeds available stock!',
      );
    }

    try {
      return await this.cartRepository.createCartItem({
        cartId: myCart.id,
        productId: product.id,
        quantity,
        unitPriceSnapshot: product.price,
      });
    } catch (error) {
      if (!prismaError(error, PrismaErrorCode.UniqueConstraint)) {
        throw error;
      }

      const concurrentCartItem =
        await this.cartRepository.findItemByCardIdAndProductId(
          myCart.id,
          product.id,
        );

      if (!concurrentCartItem) {
        throw error;
      }

      return this.incrementCartItem(
        concurrentCartItem.id,
        myCart.id,
        quantity,
        availableQuantity,
        product.price,
      );
    }
  }

  async updateCartItemQuantity(
    userId: string,
    itemId: string,
    updateCartItemQuantityDto: UpdateCartItemQuantityDto,
  ) {
    const myCart = await this.cartRepository.getMyActiveCart(userId);

    if (!myCart) {
      throw new NotFoundException('Active cart not found');
    }

    const existingCartItem =
      await this.cartRepository.findCartItemByIdAndCartId(itemId, myCart.id);
    if (!existingCartItem) {
      throw new NotFoundException('Cart Item not found');
    }

    const product = await this.productService.findProductForCart(
      existingCartItem.productId,
    );
    if (!product) {
      throw new NotFoundException('Product not found!');
    }

    if (!product.inventoryItem) {
      throw new UnprocessableEntityException('Product inventory not found');
    }

    const availableQuantity =
      product.inventoryItem.stockQuantity -
      product.inventoryItem.reservedQuantity;

    if (availableQuantity <= 0) {
      throw new UnprocessableEntityException('Product is out of stock!');
    }

    if (updateCartItemQuantityDto.quantity > availableQuantity) {
      throw new UnprocessableEntityException(
        'Requested quantity exceeds available stock!',
      );
    }

    return this.cartRepository.updateCartItemQuantity(
      existingCartItem.id,
      updateCartItemQuantityDto.quantity,
      product.price,
    );
  }

  async removeCartItem(userId: string, itemId: string) {
    const myCart = await this.cartRepository.getMyActiveCart(userId);

    if (!myCart) {
      throw new NotFoundException('Active cart not found');
    }

    const existingCartItem =
      await this.cartRepository.findCartItemByIdAndCartId(itemId, myCart.id);

    if (!existingCartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.deleteCartItem(existingCartItem.id);

    return {
      success: true,
    };
  }

  async clearCart(userId: string) {
    const myCart = await this.cartRepository.getMyActiveCart(userId);

    if (!myCart) {
      throw new NotFoundException('Active cart not found');
    }

    await this.cartRepository.deleteCartItemsByCartId(myCart.id);

    return {
      success: true,
    };
  }

  private async getOrCreateActiveCart(userId: string) {
    const activeCart = await this.cartRepository.getMyActiveCart(userId);

    if (activeCart) {
      return activeCart;
    }

    try {
      return await this.cartRepository.createNewCartForUser(userId);
    } catch (error) {
      if (!prismaError(error, PrismaErrorCode.UniqueConstraint)) {
        throw error;
      }

      const concurrentCart = await this.cartRepository.getMyActiveCart(userId);

      if (!concurrentCart) {
        throw error;
      }

      return concurrentCart;
    }
  }

  private async incrementCartItem(
    cartItemId: string,
    cartId: string,
    quantity: number,
    availableQuantity: number,
    unitPriceSnapshot: Parameters<
      CartRepository['incrementCartItemQuantity']
    >[3],
  ) {
    const result = await this.cartRepository.incrementCartItemQuantity(
      cartItemId,
      quantity,
      availableQuantity,
      unitPriceSnapshot,
    );

    if (result.count !== 1) {
      throw new UnprocessableEntityException(
        'Requested quantity exceeds available stock!',
      );
    }

    return this.cartRepository.findCartItemByIdAndCartId(cartItemId, cartId);
  }
}
