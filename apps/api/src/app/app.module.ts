import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { AddressModule } from './addresses/address.module';
import { CategoryModule } from './categories/category.module';

@Module({
  imports: [AuthModule, ProductsModule, AddressModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
