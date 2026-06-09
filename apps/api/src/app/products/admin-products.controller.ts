import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles as RoleValues } from '@e-commerce-platform/types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProductDto } from './dtos/create-product.dto';
import { ListProductsQueryDto } from './dtos/list-products-query.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductsService } from './products.service';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleValues.ADMIN)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listProducts(@Query() query: ListProductsQueryDto) {
    return this.productsService.listAdminProducts(query);
  }

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productsService.getAdminProduct(id);
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
