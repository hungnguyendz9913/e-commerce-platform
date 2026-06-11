import { Injectable } from '@nestjs/common';
import { CategoryStatus } from '@e-commerce-platform/types';
import {
  DatabaseService,
  DbClient,
  Prisma,
} from '@e-commerce-platform/database';

export const categoryInclude = {
  parent: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
  },
  children: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      parentId: true,
    },
    orderBy: {
      name: 'asc' as const,
    },
  },
  _count: {
    select: {
      products: true,
      children: true,
    },
  },
} satisfies Prisma.CategoryInclude;

export type CategoryWithRelations = Prisma.CategoryGetPayload<{
  include: typeof categoryInclude;
}>;

@Injectable()
export class CategoryRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  listAdminCategories() {
    return this.databaseService.category.findMany({
      include: categoryInclude,
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });
  }

  listPublicCategories() {
    return this.databaseService.category.findMany({
      where: {
        status: CategoryStatus.ACTIVE,
      },
      include: categoryInclude,
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });
  }

  findCategoryById(id: string, client: DbClient = this.databaseService) {
    return client.category.findUnique({
      where: { id },
      include: categoryInclude,
    });
  }

  findPublicCategoryById(id: string) {
    return this.databaseService.category.findFirst({
      where: {
        id,
        status: CategoryStatus.ACTIVE,
      },
      include: categoryInclude,
    });
  }

  findCategoryIdentityById(
    id: string,
    client: DbClient = this.databaseService,
  ) {
    return client.category.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });
  }

  findCategoryBySlug(
    slug: string,
    excludedCategoryId?: string,
    client: DbClient = this.databaseService,
  ) {
    return client.category.findFirst({
      where: {
        slug,
        NOT: excludedCategoryId ? { id: excludedCategoryId } : undefined,
      },
      select: {
        id: true,
        slug: true,
      },
    });
  }

  createCategory(
    data: Prisma.CategoryCreateArgs['data'],
    client: DbClient = this.databaseService,
  ) {
    return client.category.create({
      data,
      include: categoryInclude,
    });
  }

  updateCategory(
    id: string,
    data: Prisma.CategoryUpdateArgs['data'],
    client: DbClient = this.databaseService,
  ) {
    return client.category.update({
      where: { id },
      data,
      include: categoryInclude,
    });
  }

  findCategoryDeleteInfo(id: string) {
    return this.databaseService.category.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });
  }

  deactivateCategory(id: string) {
    return this.databaseService.category.update({
      where: { id },
      data: {
        status: CategoryStatus.INACTIVE,
      },
      include: categoryInclude,
    });
  }

  deleteCategory(id: string) {
    return this.databaseService.category.delete({
      where: { id },
    });
  }

  async findDescendantCategoryIds(categoryId: string) {
    const descendants = new Set<string>();
    let currentParentIds = [categoryId];

    while (currentParentIds.length > 0) {
      const children = await this.databaseService.category.findMany({
        where: {
          parentId: {
            in: currentParentIds,
          },
        },
        select: {
          id: true,
        },
      });

      currentParentIds = children
        .map((child) => child.id)
        .filter((id) => !descendants.has(id));

      for (const id of currentParentIds) {
        descendants.add(id);
      }
    }

    return Array.from(descendants);
  }
}