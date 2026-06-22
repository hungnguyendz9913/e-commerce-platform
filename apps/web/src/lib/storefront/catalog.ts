export type CatalogSortValue = "default" | "price_asc" | "price_desc" | "name_asc";

export type CatalogApiSort = {
  sortBy: "createdAt" | "price" | "name";
  sortOrder: "asc" | "desc";
};

export type CatalogImage = {
  id: string;
  imageUrl: string;
  altText: string;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  productCount: number;
  children: CatalogCategory[];
};

export type CatalogProductSummary = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  formattedPrice: string;
  category: Pick<CatalogCategory, "id" | "name" | "slug">;
  primaryImage: CatalogImage | null;
  inStock: boolean;
  stockQuantity: number;
};

export type CatalogProductDetail = CatalogProductSummary & {
  description: string;
  images: CatalogImage[];
};

export type CatalogPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CatalogQuery = {
  search: string;
  category: string;
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  sort: CatalogSortValue;
  page: number;
  limit: number;
};

export type CatalogProductsResult = {
  products: CatalogProductSummary[];
  pagination: CatalogPagination;
  query: CatalogQuery;
  apiQuery: {
    q?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy: CatalogApiSort["sortBy"];
    sortOrder: CatalogApiSort["sortOrder"];
    page: number;
    limit: number;
  };
};

export type CatalogSearchParams = Record<
  string,
  string | string[] | undefined
>;

export const CATALOG_SORT_OPTIONS: Array<{
  value: CatalogSortValue;
  label: string;
}> = [
  { value: "default", label: "Mặc định" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "name_asc", label: "Tên A-Z" },
];

export const PRICE_FILTERS = [
  { label: "Dưới 1 triệu", minPrice: 0, maxPrice: 1000000 },
  { label: "1 - 5 triệu", minPrice: 1000000, maxPrice: 5000000 },
  { label: "5 - 20 triệu", minPrice: 5000000, maxPrice: 20000000 },
  { label: "Trên 20 triệu", minPrice: 20000000 },
] as const;

const PAGE_SIZE = 8;

// Backend gap: product/category read endpoints are not available in this
// workspace yet. Keep temporary catalog data isolated in this service boundary
// and remove it when `/products` and `/categories` read contracts are wired.
const temporaryCategories: CatalogCategory[] = [
  {
    id: "c1",
    name: "Điện tử",
    slug: "dien-tu",
    productCount: 8,
    children: [
      {
        id: "c2",
        name: "Điện thoại",
        slug: "dien-thoai",
        parentId: "c1",
        productCount: 3,
        children: [],
      },
      {
        id: "c3",
        name: "Laptop",
        slug: "laptop",
        parentId: "c1",
        productCount: 3,
        children: [],
      },
      {
        id: "c4",
        name: "Phụ kiện",
        slug: "phu-kien",
        parentId: "c1",
        productCount: 2,
        children: [],
      },
    ],
  },
  {
    id: "c5",
    name: "Thời trang",
    slug: "thoi-trang",
    productCount: 1,
    children: [
      {
        id: "c6",
        name: "Nam",
        slug: "nam",
        parentId: "c5",
        productCount: 1,
        children: [],
      },
    ],
  },
  {
    id: "c8",
    name: "Gia dụng",
    slug: "gia-dung",
    productCount: 1,
    children: [
      {
        id: "c9",
        name: "Nhà bếp",
        slug: "nha-bep",
        parentId: "c8",
        productCount: 1,
        children: [],
      },
    ],
  },
];

const temporaryProducts: CatalogProductDetail[] = [
  createTemporaryProduct({
    id: "p1",
    sku: "IP15-PRO-256",
    name: "iPhone 15 Pro 256GB",
    slug: "iphone-15-pro-256gb",
    description:
      "iPhone 15 Pro với chip A17 Pro mạnh mẽ, camera 48MP chuyên nghiệp, khung titan cao cấp và màn hình Super Retina XDR 6.1 inch.",
    price: 27990000,
    categoryId: "c2",
    stockQuantity: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
  }),
  createTemporaryProduct({
    id: "p2",
    sku: "SS-S24U-512",
    name: "Samsung Galaxy S24 Ultra 512GB",
    slug: "samsung-galaxy-s24-ultra",
    description:
      "Samsung Galaxy S24 Ultra với bút S Pen tích hợp, camera 200MP, màn hình Dynamic AMOLED 2X 6.8 inch và RAM 12GB.",
    price: 31990000,
    categoryId: "c2",
    stockQuantity: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
  }),
  createTemporaryProduct({
    id: "p3",
    sku: "MBP-M3-14",
    name: "MacBook Pro M3 14 inch",
    slug: "macbook-pro-m3-14",
    description:
      "MacBook Pro 14 inch với chip Apple M3 Pro, RAM 18GB, SSD 512GB, màn hình Liquid Retina XDR, thời lượng pin lên đến 18 giờ.",
    price: 49990000,
    categoryId: "c3",
    stockQuantity: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
  }),
  createTemporaryProduct({
    id: "p4",
    sku: "AIR-M2-2024",
    name: "MacBook Air M2 13 inch",
    slug: "macbook-air-m2-2024",
    description:
      "MacBook Air M2 thiết kế siêu mỏng nhẹ, màn hình Liquid Retina 13.6 inch, chip M2 8 nhân, thời lượng pin 18 giờ.",
    price: 32990000,
    categoryId: "c3",
    stockQuantity: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80",
  }),
  createTemporaryProduct({
    id: "p5",
    sku: "APW-S9-GPS",
    name: "Apple Watch Series 9 GPS 45mm",
    slug: "apple-watch-series-9-gps",
    description:
      "Apple Watch Series 9 với chip S9 SiP mới, màn hình Always-On Retina, tính năng Double Tap và nhiều tính năng sức khỏe tiên tiến.",
    price: 10990000,
    categoryId: "c4",
    stockQuantity: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
  }),
  createTemporaryProduct({
    id: "p6",
    sku: "AIRPODS-PRO2",
    name: "AirPods Pro 2nd Generation",
    slug: "airpods-pro-2nd-gen",
    description:
      "AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động ANC thế hệ mới, Adaptive Audio, và hộp sạc MagSafe.",
    price: 6290000,
    categoryId: "c4",
    stockQuantity: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80",
  }),
  createTemporaryProduct({
    id: "p7",
    sku: "NK-AIR-MAX-42",
    name: "Nike Air Max 270 - Size 42",
    slug: "nike-air-max-270-42",
    description:
      "Nike Air Max 270 với đệm Max Air lớn ở phần gót, mang lại sự thoải mái cả ngày dài.",
    price: 3490000,
    categoryId: "c6",
    stockQuantity: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  }),
  createTemporaryProduct({
    id: "p8",
    sku: "BLENDER-PRO-X",
    name: "Máy Xay Sinh Tố Philips ProBlend",
    slug: "may-xay-sinh-to-philips",
    description:
      "Máy xay sinh tố công suất 1200W, dung tích 2L, 5 tốc độ, lưỡi dao thép không gỉ, dễ vệ sinh.",
    price: 1290000,
    categoryId: "c9",
    stockQuantity: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80",
  }),
  createTemporaryProduct({
    id: "p9",
    sku: "XIAOMI-14T-256",
    name: "Xiaomi 14T Pro 256GB",
    slug: "xiaomi-14t-pro",
    description:
      "Xiaomi 14T Pro với camera Leica, chip Dimensity 9300+, sạc nhanh 100W HyperCharge và màn hình AMOLED 144Hz.",
    price: 19990000,
    categoryId: "c2",
    stockQuantity: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  }),
];

export function normalizeCatalogQuery(
  searchParams: CatalogSearchParams = {},
): CatalogQuery {
  const minPrice = toOptionalPositiveNumber(firstParam(searchParams.minPrice));
  const maxPrice = toOptionalPositiveNumber(firstParam(searchParams.maxPrice));

  return {
    search: firstParam(searchParams.search)?.trim() ?? "",
    category: firstParam(searchParams.category)?.trim() ?? "",
    minPrice,
    maxPrice,
    inStock: firstParam(searchParams.inStock) === "true",
    sort: normalizeSort(firstParam(searchParams.sort)),
    page: Math.max(1, toInteger(firstParam(searchParams.page)) ?? 1),
    limit: PAGE_SIZE,
  };
}

export function toProductApiQuery(query: CatalogQuery): CatalogProductsResult["apiQuery"] {
  const sort = toApiSort(query.sort);

  return {
    q: query.search || undefined,
    categoryId: query.category || undefined,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    inStock: query.inStock ? true : undefined,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page: query.page,
    limit: query.limit,
  };
}

export async function listCatalogCategories(): Promise<CatalogCategory[]> {
  return temporaryCategories;
}

export async function listCatalogProducts(
  searchParams: CatalogSearchParams = {},
): Promise<CatalogProductsResult> {
  const query = normalizeCatalogQuery(searchParams);
  const apiQuery = toProductApiQuery(query);
  const categoryIds = query.category ? getCategoryAndChildIds(query.category) : [];
  let products = temporaryProducts.filter((product) => {
    if (query.search) {
      const searchable = `${product.name} ${product.sku} ${product.slug}`.toLowerCase();
      if (!searchable.includes(query.search.toLowerCase())) {
        return false;
      }
    }

    if (categoryIds.length > 0 && !categoryIds.includes(product.category.id)) {
      return false;
    }

    if (query.inStock && !product.inStock) {
      return false;
    }

    if (query.minPrice !== undefined && product.price < query.minPrice) {
      return false;
    }

    if (query.maxPrice !== undefined && product.price > query.maxPrice) {
      return false;
    }

    return true;
  });

  products = sortProducts(products, query.sort);

  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(query.page, totalPages);
  const paginatedProducts = products.slice((page - 1) * query.limit, page * query.limit);

  return {
    products: paginatedProducts,
    pagination: {
      page,
      limit: query.limit,
      total,
      totalPages,
    },
    query: {
      ...query,
      page,
    },
    apiQuery: {
      ...apiQuery,
      page,
    },
  };
}

export async function getCatalogProduct(
  id: string,
): Promise<CatalogProductDetail | null> {
  return temporaryProducts.find((product) => product.id === id) ?? null;
}

export async function listRelatedProducts(
  product: CatalogProductDetail,
): Promise<CatalogProductSummary[]> {
  return temporaryProducts
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        candidate.category.id === product.category.id,
    )
    .slice(0, 4);
}

export function getCategoryById(id: string): CatalogCategory | undefined {
  return flattenCategories(temporaryCategories).find((category) => category.id === id);
}

export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

export function buildProductsHref(
  query: Partial<CatalogQuery & { page: number }>,
): string {
  const params = new URLSearchParams();
  setParam(params, "search", query.search);
  setParam(params, "category", query.category);
  setParam(params, "minPrice", query.minPrice);
  setParam(params, "maxPrice", query.maxPrice);
  setParam(params, "inStock", query.inStock ? "true" : undefined);
  setParam(params, "sort", query.sort && query.sort !== "default" ? query.sort : undefined);
  setParam(params, "page", query.page && query.page > 1 ? query.page : undefined);

  const queryString = params.toString();
  return queryString ? `/products?${queryString}` : "/products";
}

export function productDetailHref(product: Pick<CatalogProductSummary, "id">): string {
  return `/products/${product.id}`;
}

function createTemporaryProduct(input: {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  stockQuantity: number;
  imageUrl: string;
}): CatalogProductDetail {
  const category = getCategoryById(input.categoryId);

  if (!category) {
    throw new Error(`Missing temporary category ${input.categoryId}`);
  }

  const primaryImage = {
    id: `${input.id}-image-1`,
    imageUrl: input.imageUrl,
    altText: input.name,
  };

  return {
    id: input.id,
    sku: input.sku,
    name: input.name,
    slug: input.slug,
    description: input.description,
    price: input.price,
    formattedPrice: formatVnd(input.price),
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
    },
    primaryImage,
    images: [primaryImage],
    inStock: input.stockQuantity > 0,
    stockQuantity: input.stockQuantity,
  };
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toInteger(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toOptionalPositiveNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function normalizeSort(value: string | undefined): CatalogSortValue {
  if (
    value === "price_asc" ||
    value === "price_desc" ||
    value === "name_asc"
  ) {
    return value;
  }

  return "default";
}

function toApiSort(sort: CatalogSortValue): CatalogApiSort {
  if (sort === "price_asc") {
    return { sortBy: "price", sortOrder: "asc" };
  }

  if (sort === "price_desc") {
    return { sortBy: "price", sortOrder: "desc" };
  }

  if (sort === "name_asc") {
    return { sortBy: "name", sortOrder: "asc" };
  }

  return { sortBy: "createdAt", sortOrder: "desc" };
}

function sortProducts<TProduct extends CatalogProductSummary>(
  products: TProduct[],
  sort: CatalogSortValue,
): TProduct[] {
  const sorted = [...products];

  if (sort === "price_asc") {
    return sorted.sort((a, b) => a.price - b.price);
  }

  if (sort === "price_desc") {
    return sorted.sort((a, b) => b.price - a.price);
  }

  if (sort === "name_asc") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }

  return sorted;
}

function getCategoryAndChildIds(categoryId: string): string[] {
  const category = getCategoryById(categoryId);

  if (!category) {
    return [categoryId];
  }

  return [category.id, ...category.children.map((child) => child.id)];
}

function flattenCategories(categories: CatalogCategory[]): CatalogCategory[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children),
  ]);
}

function setParam(
  params: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined,
) {
  if (value !== undefined && value !== "") {
    params.set(key, String(value));
  }
}
