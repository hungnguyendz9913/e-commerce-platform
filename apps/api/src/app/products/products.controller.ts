import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListProductsQueryDto } from '@e-commerce-platform/api-contracts';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listProducts(@Query() query: ListProductsQueryDto) {
    return this.productsService.listPublicProducts(query);
  }

  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productsService.getPublicProduct(id);
  }
}
