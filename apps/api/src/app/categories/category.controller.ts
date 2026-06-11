import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@e-commerce-platform/api-contracts';
import { Roles, RolesGuard } from '@e-commerce-platform/api-common';
import { Roles as RoleValues } from '@e-commerce-platform/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoryService } from './category.service';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('categories')
  listPublicCategories() {
    return this.categoryService.listPublicCategories();
  }

  @Get('categories/:id')
  getPublicCategory(@Param('id') id: string) {
    return this.categoryService.getPublicCategory(id);
  }

  @Get('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleValues.ADMIN)
  listAdminCategories() {
    return this.categoryService.listAdminCategories();
  }

  @Post('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleValues.ADMIN)
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Get('admin/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleValues.ADMIN)
  getAdminCategory(@Param('id') id: string) {
    return this.categoryService.getAdminCategory(id);
  }

  @Patch('admin/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleValues.ADMIN)
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Delete('admin/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleValues.ADMIN)
  deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}