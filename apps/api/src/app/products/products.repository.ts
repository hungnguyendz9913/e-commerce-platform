import { DatabaseService, Prisma, DbClient } from '@e-commerce-platform/database';
import {
  ProductApprovalStatus,
  ProductStatus,
} from '@e-commerce-platform/api-contracts';
import { Injectable } from '@nestjs/common';

export const productInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
  },
  images: {
    orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
  },
  inventoryItem: true,
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

@Injectable()
export class ProductsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async listProducts(
    where: Prisma.ProductWhereInput,
    orderBy: Prisma.ProductOrderByWithRelationInput,
    page: number,
    limit: number,
  ) {
    return this.databaseService.$transaction([
      this.databaseService.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.databaseService.product.count({ where }),
    ]);
  }

  findProductById(id: string, client: DbClient = this.databaseService) {
    return client.product.findUnique({
      where: { id },
      include: productInclude,
    });
  }

  findPublicProductById(id: string) {
    return this.databaseService.product.findFirst({
      where: {
        id,
        status: ProductStatus.ACTIVE,
        approvalStatus: ProductApprovalStatus.APPROVED,
        category: {
          is: {
            status: 'ACTIVE',
          },
        },
      },
      include: productInclude,
    });
  }

  findActiveCategory(
    categoryId: string,
    client: DbClient = this.databaseService,
  ) {
    return client.category.findFirst({
      where: {
        id: categoryId,
        status: 'ACTIVE',
      },
      select: { id: true },
    });
  }

  findProductBySkuOrSlug(
    conditions: Prisma.ProductWhereInput[],
    excludedProductId?: string,
    client: DbClient = this.databaseService,
  ) {
    return client.product.findFirst({
      where: {
        OR: conditions,
        NOT: excludedProductId ? { id: excludedProductId } : undefined,
      },
      select: { id: true, sku: true, slug: true },
    });
  }

  createProduct(
    data: Prisma.ProductCreateArgs['data'],
    client: DbClient = this.databaseService,
  ) {
    return client.product.create({
      data,
      include: productInclude,
    });
  }

  updateProduct(
    id: string,
    data: Prisma.ProductUpdateArgs['data'],
    client: DbClient = this.databaseService,
  ) {
    return client.product.update({
      where: { id },
      data,
      include: productInclude,
    });
  }

  findProductDeleteInfo(
    id: string,
    client: DbClient = this.databaseService,
  ) {
    return client.product.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            cartItems: true,
            orderItems: true,
            inventoryMovements: true,
          },
        },
      },
    });
  }

  archiveProduct(
    id: string,
    client: DbClient = this.databaseService,
  ) {
    return client.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
      include: productInclude,
    });
  }

  deleteProduct(
    id: string,
    client: DbClient = this.databaseService,
  ) {
    return client.product.delete({
      where: { id },
    });
  }

  findProductForCart(productId: string) {
    return this.databaseService.product.findFirst({
      where: {
        id: productId,
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        category: {
          is: {
            status: 'ACTIVE',
          },
        },
      },
      include: {
        inventoryItem: true,
      },
    });
  }

  buildInventoryAvailabilityFilter(
    inStock: boolean,
  ): Prisma.InventoryItemNullableScalarRelationFilter {
    const reservedQuantityField =
      this.databaseService.inventoryItem.fields.reservedQuantity;

    return {
      is: {
        stockQuantity: inStock
          ? { gt: reservedQuantityField }
          : { lte: reservedQuantityField },
      },
    };
  }
}
