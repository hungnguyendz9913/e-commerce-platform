import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  DatabaseService,
  TransactionService,
} from '@e-commerce-platform/database';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';
import { InventoryService } from '../inventory/inventory.service';

const createdAt = new Date('2026-06-09T01:00:00.000Z');
const updatedAt = new Date('2026-06-09T02:00:00.000Z');

function productFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-id',
    categoryId: 'category-id',
    sku: 'SKU-1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Description',
    price: { toString: () => '100.00' },
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    createdAt,
    updatedAt,
    category: {
      id: 'category-id',
      name: 'Category',
      slug: 'category',
      status: 'ACTIVE',
    },
    images: [
      {
        id: 'image-id',
        imageUrl: 'https://example.com/image.jpg',
        altText: 'Image',
        sortOrder: 0,
        isPrimary: true,
        createdAt,
      },
    ],
    inventoryItem: {
      id: 'inventory-id',
      productId: 'product-id',
      stockQuantity: 5,
      reservedQuantity: 1,
      version: 0,
      updatedAt,
    },
    ...overrides,
  };
}

function createDatabaseMock() {
  const transaction = {
    category: {
      findFirst: jest.fn().mockResolvedValue({ id: 'category-id' }),
    },
    product: {
      findFirst: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(productFixture()),
      create: jest.fn().mockResolvedValue(productFixture()),
      update: jest.fn().mockResolvedValue(productFixture()),
    },
  };
  const databaseService = {
    product: {
      findMany: jest.fn().mockResolvedValue([productFixture()]),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn().mockResolvedValue(productFixture()),
      findFirst: jest.fn().mockResolvedValue(productFixture()),
      update: jest.fn().mockResolvedValue(
        productFixture({
          status: 'ARCHIVED',
        }),
      ),
      delete: jest.fn(),
    },
    $transaction: jest.fn((input: unknown) => {
      if (Array.isArray(input)) {
        return Promise.all(input);
      }

      if (typeof input === 'function') {
        return input(transaction);
      }

      return input;
    }),
  };

  return {
    transaction,
    databaseService: databaseService as unknown as DatabaseService,
    rawDatabaseService: databaseService,
  };
}

function createInventoryServiceMock() {
  return {
    initializeProductInventory: jest.fn().mockResolvedValue(undefined),
    updateProductInventoryFromAdminProduct: jest
      .fn()
      .mockResolvedValue(undefined),
  };
}

function createService(
  databaseService: DatabaseService,
  transaction: unknown,
  inventoryService = createInventoryServiceMock(),
) {
  const transactionService = {
    run: jest.fn((callback) => callback(transaction)),
  };

  return {
    service: new ProductsService(
      new ProductsRepository(databaseService),
      transactionService as unknown as TransactionService,
      inventoryService as unknown as InventoryService,
    ),
    transactionService,
    inventoryService,
  };
}

describe('ProductsService', () => {
  it('should list admin products with filters and management summary fields', async () => {
    const { databaseService, rawDatabaseService } = createDatabaseMock();
    const { service } = createService(databaseService, {});

    await expect(
      service.listAdminProducts({
        page: 2,
        limit: 10,
        q: 'test',
        categoryId: 'category-id',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        minPrice: 1,
        maxPrice: 200,
        inStock: true,
        sortBy: 'price',
        sortOrder: 'asc',
      }),
    ).resolves.toMatchObject({
      data: [
        {
          id: 'product-id',
          sku: 'SKU-1',
          status: 'active',
          approvalStatus: 'approved',
          stockQuantity: 5,
          reservedQuantity: 1,
          category: { id: 'category-id' },
          primaryImage: { id: 'image-id' },
        },
      ],
      meta: {
        page: 2,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
    expect(rawDatabaseService.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        orderBy: { price: 'asc' },
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { sku: { contains: 'test', mode: 'insensitive' } },
            { slug: { contains: 'test', mode: 'insensitive' } },
          ],
          categoryId: 'category-id',
          status: 'ACTIVE',
          approvalStatus: 'APPROVED',
          price: {
            gte: 1,
            lte: 200,
          },
          inventoryItem: {
            is: {
              stockQuantity: {
                gt: 0,
              },
            },
          },
        }),
      }),
    );
  });

  it('should return admin detail for products regardless of public visibility', async () => {
    const { databaseService, rawDatabaseService } = createDatabaseMock();
    rawDatabaseService.product.findUnique.mockResolvedValue(
      productFixture({
        status: 'INACTIVE',
        approvalStatus: 'REJECTED',
      }),
    );
    const { service } = createService(databaseService, {});

    await expect(service.getAdminProduct('product-id')).resolves.toMatchObject({
      data: {
        id: 'product-id',
        sku: 'SKU-1',
        status: 'inactive',
        approvalStatus: 'rejected',
        stockQuantity: 5,
        reservedQuantity: 1,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        images: [{ id: 'image-id' }],
      },
    });
    expect(rawDatabaseService.product.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'product-id' },
      }),
    );
  });

  it('should create a product with category, images, and delegated inventory initialization', async () => {
    const { databaseService, transaction } = createDatabaseMock();
    const { service, transactionService, inventoryService } = createService(
      databaseService,
      transaction,
    );

    await expect(
      service.createProduct({
        sku: 'SKU-1',
        name: 'Test Product',
        slug: 'test-product',
        price: 100,
        categoryId: 'category-id',
        images: [
          {
            imageUrl: 'https://example.com/image.jpg',
            isPrimary: true,
          },
        ],
        inventory: {
          stockQuantity: 5,
          reservedQuantity: 1,
        },
      }),
    ).resolves.toMatchObject({
      data: {
        id: 'product-id',
        sku: 'SKU-1',
        stockQuantity: 5,
        reservedQuantity: 1,
      },
    });
    expect(transaction.category.findFirst).toHaveBeenCalledWith({
      where: { id: 'category-id', status: 'ACTIVE' },
      select: { id: true },
    });
    expect(transactionService.run).toHaveBeenCalledWith(expect.any(Function));
    expect(transaction.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ sku: 'SKU-1' }, { slug: 'test-product' }],
        }),
      }),
    );
    expect(transaction.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          categoryId: 'category-id',
          images: {
            create: [
              expect.objectContaining({
                imageUrl: 'https://example.com/image.jpg',
                isPrimary: true,
              }),
            ],
          },
        }),
      }),
    );
    expect(inventoryService.initializeProductInventory).toHaveBeenCalledWith(
      'product-id',
      {
        stockQuantity: 5,
        reservedQuantity: 1,
      },
      transaction,
    );
    expect(transaction.product.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'product-id' },
      }),
    );
  });

  it('should reject duplicate SKU or slug during create', async () => {
    const { databaseService, transaction } = createDatabaseMock();
    transaction.product.findFirst.mockResolvedValue({
      id: 'other-product',
      sku: 'SKU-1',
      slug: 'other-product',
    });
    const { service, transactionService } = createService(
      databaseService,
      transaction,
    );

    await expect(
      service.createProduct({
        sku: 'SKU-1',
        name: 'Test Product',
        slug: 'test-product',
        price: 100,
        categoryId: 'category-id',
      }),
    ).rejects.toThrow(ConflictException);
    expect(transactionService.run).toHaveBeenCalledWith(expect.any(Function));
    expect(transaction.product.create).not.toHaveBeenCalled();
  });

  it('should reject inactive categories during create', async () => {
    const { databaseService, transaction } = createDatabaseMock();
    transaction.category.findFirst.mockResolvedValue(null);
    const { service } = createService(databaseService, transaction);

    await expect(
      service.createProduct({
        sku: 'SKU-1',
        name: 'Test Product',
        slug: 'test-product',
        price: 100,
        categoryId: 'inactive-category-id',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(transaction.product.create).not.toHaveBeenCalled();
  });

  it('should update partial product fields, replace images, and delegate inventory update', async () => {
    const { databaseService, transaction } = createDatabaseMock();
    transaction.product.findUnique
      .mockResolvedValueOnce(productFixture())
      .mockResolvedValueOnce(
        productFixture({
          name: 'Updated Product',
          inventoryItem: {
            id: 'inventory-id',
            productId: 'product-id',
            stockQuantity: 8,
            reservedQuantity: 1,
            version: 0,
            updatedAt,
          },
        }),
      );
    transaction.product.update.mockResolvedValue(
      productFixture({
        name: 'Updated Product',
        inventoryItem: {
          id: 'inventory-id',
          productId: 'product-id',
          stockQuantity: 8,
          reservedQuantity: 1,
          version: 0,
          updatedAt,
        },
      }),
    );
    const { service, transactionService, inventoryService } = createService(
      databaseService,
      transaction,
    );

    await expect(
      service.updateProduct('product-id', {
        name: 'Updated Product',
        images: [{ imageUrl: 'https://example.com/new.jpg' }],
        inventory: { stockQuantity: 8 },
      }),
    ).resolves.toMatchObject({
      data: {
        name: 'Updated Product',
        stockQuantity: 8,
      },
    });
    expect(transaction.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'product-id' },
        data: expect.objectContaining({
          name: 'Updated Product',
          images: {
            deleteMany: {},
            create: [
              expect.objectContaining({
                imageUrl: 'https://example.com/new.jpg',
              }),
            ],
          },
        }),
      }),
    );
    expect(transactionService.run).toHaveBeenCalledWith(expect.any(Function));
    expect(
      inventoryService.updateProductInventoryFromAdminProduct,
    ).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        stockQuantity: 5,
        reservedQuantity: 1,
      }),
      { stockQuantity: 8 },
      transaction,
    );
  });

  it('should update only provided product fields without replacing images or inventory when omitted', async () => {
    const { databaseService, transaction } = createDatabaseMock();
    transaction.product.update.mockResolvedValue(
      productFixture({
        name: 'Name Only',
      }),
    );
    const { service, inventoryService } = createService(
      databaseService,
      transaction,
    );

    await expect(
      service.updateProduct('product-id', {
        name: 'Name Only',
      }),
    ).resolves.toMatchObject({
      data: {
        name: 'Name Only',
      },
    });
    expect(transaction.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'product-id' },
        data: expect.objectContaining({
          name: 'Name Only',
          images: undefined,
        }),
      }),
    );
    expect(
      inventoryService.updateProductInventoryFromAdminProduct,
    ).not.toHaveBeenCalled();
  });

  it('should hard-delete products without protected references', async () => {
    const { databaseService, rawDatabaseService } = createDatabaseMock();
    rawDatabaseService.product.findUnique.mockResolvedValue({
      id: 'product-id',
      _count: {
        cartItems: 0,
        orderItems: 0,
        inventoryMovements: 0,
      },
    });
    const { service } = createService(databaseService, {});

    await expect(service.deleteProduct('product-id')).resolves.toEqual({
      data: {
        deleted: true,
        archived: false,
        id: 'product-id',
      },
    });
    expect(rawDatabaseService.product.delete).toHaveBeenCalledWith({
      where: { id: 'product-id' },
    });
  });

  it('should archive products with protected references', async () => {
    const { databaseService, rawDatabaseService } = createDatabaseMock();
    rawDatabaseService.product.findUnique.mockResolvedValue({
      id: 'product-id',
      _count: {
        cartItems: 0,
        orderItems: 1,
        inventoryMovements: 0,
      },
    });
    const { service } = createService(databaseService, {});

    await expect(service.deleteProduct('product-id')).resolves.toMatchObject({
      data: {
        deleted: false,
        archived: true,
        product: {
          id: 'product-id',
          status: 'archived',
        },
      },
    });
    expect(rawDatabaseService.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'product-id' },
        data: { status: 'ARCHIVED' },
      }),
    );
  });

  it('should query public listings with active approved visibility only', async () => {
    const { databaseService, rawDatabaseService } = createDatabaseMock();
    const { service } = createService(databaseService, {});

    const result = await service.listPublicProducts({});

    expect(result).toMatchObject({
      data: [
        {
          id: 'product-id',
          name: 'Test Product',
          slug: 'test-product',
          price: '100.00',
          category: { id: 'category-id' },
          primaryImage: { id: 'image-id' },
          inStock: true,
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    expect(rawDatabaseService.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
          approvalStatus: 'APPROVED',
        }),
      }),
    );
    expect(result.data[0]).not.toHaveProperty('sku');
    expect(result.data[0]).not.toHaveProperty('approvalStatus');
  });

  it('should hide inactive, archived, pending, and rejected product details', async () => {
    const { databaseService, rawDatabaseService } = createDatabaseMock();
    rawDatabaseService.product.findFirst.mockResolvedValue(null);
    const { service } = createService(databaseService, {});

    await expect(service.getPublicProduct('product-id')).rejects.toThrow(
      NotFoundException,
    );
    expect(rawDatabaseService.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'product-id',
          status: 'ACTIVE',
          approvalStatus: 'APPROVED',
        },
      }),
    );
  });
});
