import React from "react";
import { render, screen } from "@testing-library/react";
import ProductCard from "../src/components/storefront/product-card";
import HomepageHeader from "../src/components/ui/homepage-header";
import {
  listCatalogProducts,
  normalizeCatalogQuery,
  toProductApiQuery,
} from "../src/lib/storefront/catalog";

jest.mock("next/navigation", () => ({
  usePathname: () => "/products",
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("catalog query mapping", () => {
  it("maps storefront search, category, and sort params to product API params", () => {
    const query = normalizeCatalogQuery({
      search: " iphone ",
      category: "c1",
      minPrice: "1000000",
      maxPrice: "5000000",
      inStock: "true",
      sort: "price_asc",
      page: "2",
    });

    expect(query).toMatchObject({
      search: "iphone",
      category: "c1",
      minPrice: 1000000,
      maxPrice: 5000000,
      inStock: true,
      sort: "price_asc",
      page: 2,
    });
    expect(toProductApiQuery(query)).toMatchObject({
      q: "iphone",
      categoryId: "c1",
      sortBy: "price",
      sortOrder: "asc",
      page: 2,
    });
  });

  it("filters parent categories through descendant category ids", async () => {
    const result = await listCatalogProducts({ category: "c1" });

    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.every((product) => ["c2", "c3", "c4"].includes(product.category.id))).toBe(true);
  });
});

describe("storefront catalog navigation", () => {
  it("renders catalog links and search form in the header", () => {
    render(<HomepageHeader />);

    const searchInput = screen.getAllByLabelText("Tìm kiếm sản phẩm")[0];
    const form = searchInput.closest("form");

    expect(form?.getAttribute("action")).toBe("/products");
    expect(form?.getAttribute("method")).toBe("get");
    expect(screen.getAllByRole("link", { name: "Tất cả sản phẩm" })[0]?.getAttribute("href")).toBe("/products");
    expect(screen.getAllByRole("link", { name: "Điện tử" })[0]?.getAttribute("href")).toBe("/products?category=c1");
  });
});

describe("ProductCard", () => {
  it("links to product detail and exposes a scoped add-to-cart action", () => {
    render(
      <ProductCard
        product={{
          id: "p-test",
          sku: "SKU-1",
          name: "Test Product",
          slug: "test-product",
          price: 100000,
          formattedPrice: "100.000đ",
          category: { id: "c1", name: "Điện tử", slug: "dien-tu" },
          primaryImage: null,
          inStock: true,
          stockQuantity: 4,
        }}
      />,
    );

    expect(screen.getAllByRole("link", { name: /Test Product|Xem/i })[0]?.getAttribute("href")).toBe("/products/p-test");
    expect(screen.getByRole("button", { name: "Thêm" })).toBeTruthy();
    expect(screen.getByText("Còn 4 sản phẩm")).toBeTruthy();
  });
});
