import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@e-commerce-platform/api-contracts';
import { CategoryStatus } from '@e-commerce-platform/types';
import { prismaError, PrismaErrorCode } from '@e-commerce-platform/utils';
import {
  CategoryRepository,
  CategoryWithRelations,
} from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async listPublicCategories() {
    const categories = await this.categoryRepository.listPublicCategories();

    return {
      data: categories.map((category) => this.toPublicCategory(category)),
    };
  }

  async getPublicCategory(id: string) {
    const category = await this.categoryRepository.findPublicCategoryById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      data: this.toPublicCategory(category),
    };
  }

  async listAdminCategories() {
    const categories = await this.categoryRepository.listAdminCategories();

    return {
      data: categories.map((category) => this.toAdminCategory(category)),
    };
  }

  async getAdminCategory(id: string) {
    const category = await this.categoryRepository.findCategoryById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      data: this.toAdminCategory(category),
    };
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      await this.assertUniqueSlug(createCategoryDto.slug);

      if (createCategoryDto.parentId) {
        await this.assertParentExists(createCategoryDto.parentId);
      }

      const category = await this.categoryRepository.createCategory({
        name: createCategoryDto.name,
        slug: createCategoryDto.slug,
        description: createCategoryDto.description,
        parentId: createCategoryDto.parentId,
        status: createCategoryDto.status,
      });

      return {
        data: this.toAdminCategory(category),
      };
    } catch (error) {
      this.mapPrismaError(error);
      throw error;
    }
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const existingCategory = await this.categoryRepository.findCategoryById(id);

      if (!existingCategory) {
        throw new NotFoundException('Category not found');
      }

      if (updateCategoryDto.slug) {
        await this.assertUniqueSlug(updateCategoryDto.slug, id);
      }

      if (updateCategoryDto.parentId !== undefined) {
        await this.validateParentUpdate(id, updateCategoryDto.parentId);
      }

      const category = await this.categoryRepository.updateCategory(id, {
        name: updateCategoryDto.name,
        slug: updateCategoryDto.slug,
        description: updateCategoryDto.description,
        parentId: updateCategoryDto.parentId,
        status: updateCategoryDto.status,
      });

      return {
        data: this.toAdminCategory(category),
      };
    } catch (error) {
      this.mapPrismaError(error);
      throw error;
    }
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.findCategoryDeleteInfo(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const hasProtectedReferences =
      category._count.products > 0 || category._count.children > 0;

    if (hasProtectedReferences) {
      const inactiveCategory = await this.categoryRepository.deactivateCategory(
        id,
      );

      return {
        data: {
          deleted: false,
          deactivated: true,
          category: this.toAdminCategory(inactiveCategory),
        },
      };
    }

    await this.categoryRepository.deleteCategory(id);

    return {
      data: {
        deleted: true,
        deactivated: false,
        id,
      },
    };
  }

  private async validateParentUpdate(categoryId: string, parentId?: string) {
    if (!parentId) {
      return;
    }

    if (categoryId === parentId) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    await this.assertParentExists(parentId);

    const descendantIds =
      await this.categoryRepository.findDescendantCategoryIds(categoryId);

    if (descendantIds.includes(parentId)) {
      throw new BadRequestException(
        'Category cannot use its descendant as parent',
      );
    }
  }

  private async assertParentExists(parentId: string) {
    const parentCategory =
      await this.categoryRepository.findCategoryIdentityById(parentId);

    if (!parentCategory) {
      throw new NotFoundException('Parent category not found');
    }
  }

  private async assertUniqueSlug(slug: string, excludedCategoryId?: string) {
    const existingCategory =
      await this.categoryRepository.findCategoryBySlug(
        slug,
        excludedCategoryId,
      );

    if (existingCategory) {
      throw new ConflictException('Category slug already exists');
    }
  }

  private mapPrismaError(error: unknown) {
    if (prismaError(error, PrismaErrorCode.UniqueConstraint)) {
      throw new ConflictException('Category slug already exists');
    }
  }

  private toPublicCategory(category: CategoryWithRelations) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      children: category.children
        .filter((child) => child.status === CategoryStatus.ACTIVE)
        .map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          parentId: child.parentId,
        })),
    };
  }

  private toAdminCategory(category: CategoryWithRelations) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      status: category.status.toLowerCase(),
      parentId: category.parentId,
      parent: category.parent
        ? {
            id: category.parent.id,
            name: category.parent.name,
            slug: category.parent.slug,
            status: category.parent.status.toLowerCase(),
          }
        : null,
      children: category.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        status: child.status.toLowerCase(),
        parentId: child.parentId,
      })),
      productCount: category._count.products,
      childCount: category._count.children,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}