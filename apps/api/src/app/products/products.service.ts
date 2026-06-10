import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@e-commerce-platform/database';
import { prismaError, PrismaErrorCode } from '@e-commerce-platform/utils';
import {
  CreateProductDto,
  ListProductsQueryDto,
  ProductApprovalStatus,
  ProductImageDto,
  ProductInventoryDto,
  ProductSortField,
  ProductStatus,
  UpdateProductDto,
} from '@e-commerce-platform/api-contracts';
import {
  ProductTransaction,
  ProductWithRelations,
  ProductsRepository,
} from './products.repository';
import { TransactionService } from '@e-commerce-platform/database';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository, private readonly transactionService: TransactionService) {}

  async listAdminProducts(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildProductWhere(query, false);
    const orderBy = this.buildProductOrderBy(query);

    const [products, total] = await this.productsRepository.listProducts(
      where,
      orderBy,
      page,
      limit,
    );

    return {
      data: products.map((product) => this.toAdminSummary(product)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listPublicProducts(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildProductWhere(query, true);
    const orderBy = this.buildProductOrderBy(query);

    const [products, total] = await this.productsRepository.listProducts(
      where,
      orderBy,
      page,
      limit,
    );

    return {
      data: products.map((product) => this.toPublicSummary(product)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminProduct(id: string) {
    const product = await this.productsRepository.findAdminProductById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      data: this.toAdminDetail(product),
    };
  }

  async getPublicProduct(id: string) {
    const product = await this.productsRepository.findPublicProductById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      data: this.toPublicDetail(product),
    };
  }

  async createProduct(createProductDto: CreateProductDto) {
    try {
      const product = await this.transactionService.run(
        async (transaction) => {
          await this.assertActiveCategory(
            transaction,
            createProductDto.categoryId,
          );
          await this.assertUniqueSkuAndSlug(
            transaction,
            createProductDto.sku,
            createProductDto.slug,
          );

          const stockQuantity = createProductDto.inventory?.stockQuantity ?? 0;
          const reservedQuantity =
            createProductDto.inventory?.reservedQuantity ?? 0;
          this.assertInventoryValues({ stockQuantity, reservedQuantity });

          const createdProduct = await this.productsRepository.createProduct(
            transaction,
            {
              sku: createProductDto.sku,
              name: createProductDto.name,
              slug: createProductDto.slug,
              description: createProductDto.description,
              price: createProductDto.price,
              categoryId: createProductDto.categoryId,
              status: createProductDto.status,
              approvalStatus: createProductDto.approvalStatus,
              images: this.createImagesInput(createProductDto.images),
              inventoryItem: {
                create: {
                  stockQuantity,
                  reservedQuantity,
                },
              },
            },
          );

          if (stockQuantity > 0) {
            await this.productsRepository.createInventoryMovement(transaction, {
              productId: createdProduct.id,
              movementType: 'IMPORT',
              quantity: stockQuantity,
              beforeQuantity: 0,
              afterQuantity: stockQuantity,
              reason: 'Initial product stock',
            });
          }

          return createdProduct;
        },
      );

      return {
        data: this.toAdminDetail(product),
      };
    } catch (error) {
      this.mapPrismaError(error);
      throw error;
    }
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.transactionService.run(
        async (transaction) => {
          const existingProduct =
            await this.productsRepository.findProductForUpdate(transaction, id);

          if (!existingProduct) {
            throw new NotFoundException('Product not found');
          }

          if (updateProductDto.categoryId) {
            await this.assertActiveCategory(
              transaction,
              updateProductDto.categoryId,
            );
          }

          if (updateProductDto.sku || updateProductDto.slug) {
            await this.assertUniqueSkuAndSlug(
              transaction,
              updateProductDto.sku,
              updateProductDto.slug,
              id,
            );
          }

          const inventoryData = this.mergeInventoryValues(
            existingProduct.inventoryItem,
            updateProductDto.inventory,
          );

          const updatedProduct = await this.productsRepository.updateProduct(
            transaction,
            id,
            {
              sku: updateProductDto.sku,
              name: updateProductDto.name,
              slug: updateProductDto.slug,
              description: updateProductDto.description,
              price: updateProductDto.price,
              categoryId: updateProductDto.categoryId,
              status: updateProductDto.status,
              approvalStatus: updateProductDto.approvalStatus,
              images:
                updateProductDto.images === undefined
                  ? undefined
                  : {
                      deleteMany: {},
                      create: this.toImageCreateMany(updateProductDto.images),
                    },
              inventoryItem:
                updateProductDto.inventory === undefined
                  ? undefined
                  : {
                      upsert: {
                        create: inventoryData.next,
                        update: inventoryData.next,
                      },
                    },
            },
          );

          if (
            updateProductDto.inventory?.stockQuantity !== undefined &&
            inventoryData.previousStockQuantity !==
              inventoryData.next.stockQuantity
          ) {
            await this.productsRepository.createInventoryMovement(transaction, {
              productId: id,
              movementType: 'ADJUSTMENT',
              quantity:
                inventoryData.next.stockQuantity -
                inventoryData.previousStockQuantity,
              beforeQuantity: inventoryData.previousStockQuantity,
              afterQuantity: inventoryData.next.stockQuantity,
              reason: 'Admin product inventory update',
            });
          }

          return updatedProduct;
        },
      );

      return {
        data: this.toAdminDetail(product),
      };
    } catch (error) {
      this.mapPrismaError(error);
      throw error;
    }
  }

  async deleteProduct(id: string) {
    const product = await this.productsRepository.findProductDeleteInfo(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const hasProtectedReferences =
      product._count.cartItems > 0 ||
      product._count.orderItems > 0 ||
      product._count.inventoryMovements > 0;

    if (hasProtectedReferences) {
      const archivedProduct = await this.productsRepository.archiveProduct(id);

      return {
        data: {
          deleted: false,
          archived: true,
          product: this.toAdminDetail(archivedProduct),
        },
      };
    }

    await this.productsRepository.deleteProduct(id);

    return {
      data: {
        deleted: true,
        archived: false,
        id,
      },
    };
  }

  private buildProductWhere(
    query: ListProductsQueryDto,
    publicOnly: boolean,
  ): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (publicOnly) {
      where.status = ProductStatus.ACTIVE;
      where.approvalStatus = ProductApprovalStatus.APPROVED;
    } else {
      where.status = query.status;
      where.approvalStatus = query.approvalStatus;
    }

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { sku: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        gte: query.minPrice,
        lte: query.maxPrice,
      };
    }

    if (query.inStock !== undefined) {
      where.inventoryItem = query.inStock
        ? { is: { stockQuantity: { gt: 0 } } }
        : { is: { stockQuantity: 0 } };
    }

    return where;
  }

  private buildProductOrderBy(
    query: ListProductsQueryDto,
  ): Prisma.ProductOrderByWithRelationInput {
    const sortBy = query.sortBy ?? ProductSortField.CREATED_AT;
    const sortOrder = query.sortOrder ?? 'desc';

    return {
      [sortBy]: sortOrder,
    };
  }

  private async assertActiveCategory(
    transaction: ProductTransaction,
    categoryId: string,
  ) {
    const category = await this.productsRepository.findActiveCategory(
      transaction,
      categoryId,
    );

    if (!category) {
      throw new NotFoundException('Active category not found');
    }
  }

  private async assertUniqueSkuAndSlug(
    transaction: ProductTransaction,
    sku?: string,
    slug?: string,
    excludedProductId?: string,
  ) {
    const conditions: Prisma.ProductWhereInput[] = [];

    if (sku) {
      conditions.push({ sku });
    }

    if (slug) {
      conditions.push({ slug });
    }

    if (conditions.length === 0) {
      return;
    }

    const existingProduct =
      await this.productsRepository.findProductBySkuOrSlug(
        transaction,
        conditions,
        excludedProductId,
      );

    if (!existingProduct) {
      return;
    }

    if (sku && existingProduct.sku === sku) {
      throw new ConflictException('SKU already exists');
    }

    throw new ConflictException('Slug already exists');
  }

  private createImagesInput(images?: ProductImageDto[]) {
    if (images === undefined) {
      return undefined;
    }

    return {
      create: this.toImageCreateMany(images),
    };
  }

  private toImageCreateMany(images: ProductImageDto[]) {
    return images.map((image, index) => ({
      imageUrl: image.imageUrl,
      altText: image.altText,
      sortOrder: image.sortOrder ?? index,
      isPrimary: image.isPrimary ?? false,
    }));
  }

  private mergeInventoryValues(
    existingInventory: ProductWithRelations['inventoryItem'],
    inventory?: ProductInventoryDto,
  ) {
    const previousStockQuantity = existingInventory?.stockQuantity ?? 0;
    const previousReservedQuantity = existingInventory?.reservedQuantity ?? 0;
    const next = {
      stockQuantity: inventory?.stockQuantity ?? previousStockQuantity,
      reservedQuantity: inventory?.reservedQuantity ?? previousReservedQuantity,
    };

    this.assertInventoryValues(next);

    return {
      next,
      previousStockQuantity,
    };
  }

  private assertInventoryValues(inventory: {
    stockQuantity: number;
    reservedQuantity: number;
  }) {
    if (
      inventory.stockQuantity < 0 ||
      inventory.reservedQuantity < 0 ||
      inventory.reservedQuantity > inventory.stockQuantity
    ) {
      throw new BadRequestException('Invalid inventory quantities');
    }
  }

  private mapPrismaError(error: unknown) {
    if (prismaError(error, PrismaErrorCode.UniqueConstraint)) {
      throw new ConflictException('Product SKU or slug already exists');
    }
  }

  private toAdminSummary(product: ProductWithRelations) {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      price: this.formatDecimal(product.price),
      status: product.status.toLowerCase(),
      approvalStatus: product.approvalStatus.toLowerCase(),
      category: this.toCategory(product.category),
      primaryImage: this.toPrimaryImage(product),
      stockQuantity: product.inventoryItem?.stockQuantity ?? 0,
      reservedQuantity: product.inventoryItem?.reservedQuantity ?? 0,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  private toAdminDetail(product: ProductWithRelations) {
    return {
      ...this.toAdminSummary(product),
      description: product.description,
      images: product.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
        createdAt: image.createdAt.toISOString(),
      })),
    };
  }

  private toPublicSummary(product: ProductWithRelations) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: this.formatDecimal(product.price),
      category: this.toCategory(product.category),
      primaryImage: this.toPrimaryImage(product),
      inStock: (product.inventoryItem?.stockQuantity ?? 0) > 0,
    };
  }

  private toPublicDetail(product: ProductWithRelations) {
    return {
      ...this.toPublicSummary(product),
      description: product.description,
      images: product.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      })),
      stockQuantity: product.inventoryItem?.stockQuantity ?? 0,
    };
  }

  private toCategory(productCategory: ProductWithRelations['category']) {
    return {
      id: productCategory.id,
      name: productCategory.name,
      slug: productCategory.slug,
      status: productCategory.status.toLowerCase(),
    };
  }

  private toPrimaryImage(product: ProductWithRelations) {
    const primaryImage =
      product.images.find((image) => image.isPrimary) ?? product.images[0];

    if (!primaryImage) {
      return null;
    }

    return {
      id: primaryImage.id,
      imageUrl: primaryImage.imageUrl,
      altText: primaryImage.altText,
    };
  }

  private formatDecimal(value: unknown) {
    if (
      typeof value === 'object' &&
      value !== null &&
      'toString' in value &&
      typeof value.toString === 'function'
    ) {
      return value.toString();
    }

    return String(value);
  }
}
