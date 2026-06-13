import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { AddressModule } from './addresses/address.module';
import { CategoryModule } from './categories/category.module';
import { CartModule } from './carts/cart.module';
import { VoucherModule } from './vouchers/voucher.module';

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    AddressModule,
    CategoryModule,
    CartModule,
    VoucherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
