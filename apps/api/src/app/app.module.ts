import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { AddressModule } from './addresses/address.module';

@Module({
  imports: [AuthModule, ProductsModule, AddressModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
