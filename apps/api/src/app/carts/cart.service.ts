import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { AddItemToCartDto, UpdateCartItemQuantityDto } from '@e-commerce-platform/api-contracts';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor (private readonly cartRepository: CartRepository, private readonly productService: ProductsService) {}

  async getMyActiveCart(userId: string) {
    return this.cartRepository.getMyActiveCart(userId);
  }

  async addItemToCart(userId: string, addItemToCartDto: AddItemToCartDto) {
    const quantity: number = addItemToCartDto.quantity ?? 1;
    let myCart = await this.cartRepository.getMyActiveCart(userId);
    
    if (!myCart) {
      myCart = await this.cartRepository.createNewCartForUser(userId);
    }

    const product = await this.productService.findProductForCart(addItemToCartDto.productId);
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

    const existingCartItem = await this.cartRepository.findItemByCardIdAndProductId(myCart.id, product.id);
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      if (newQuantity > availableQuantity) {
        throw new UnprocessableEntityException(
          'Requested quantity exceeds available stock!',
        );
      }

      return this.cartRepository.updateCartItemQuantity(
        existingCartItem.id,
        newQuantity,
        product.price
      );
    }

    if (quantity > availableQuantity) {
      throw new UnprocessableEntityException(
        'Requested quantity exceeds available stock!',
      );
    }

    return this.cartRepository.createCartItem({
      cartId: myCart.id,
      productId: product.id,
      quantity,
      unitPriceSnapshot: product.price,
    });
  }

  async updateCartItemQuantity(userId: string, itemId: string, updateCartItemQuantityDto: UpdateCartItemQuantityDto) {
    const myCart = await this.cartRepository.getMyActiveCart(userId);
    
    if (!myCart) {
      throw new NotFoundException('Active cart not found');
    }

    const existingCartItem = await this.cartRepository.findCartItemByIdAndCartId(itemId, myCart.id);
    if (!existingCartItem) {
      throw new NotFoundException('Cart Item not found');
    }

    const product = await this.productService.findProductForCart(existingCartItem.productId);
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
        product.price
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
}
