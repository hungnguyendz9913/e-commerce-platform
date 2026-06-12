import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { ProductsModule } from '../products/products.module';

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepository],
  imports: [ProductsModule]
})
export class CartModule {}
