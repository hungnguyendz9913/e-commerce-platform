import { buildAdminQuery } from "../src/lib/admin/api";
import {
  normalizeAdminCategories,
  normalizeAdminProducts,
  normalizeAdminVouchers,
} from "../src/lib/admin/normalizers";
import { adminStatus } from "../src/lib/admin/status";
import { adminMutationSupport } from "../src/lib/admin/service";
import { requiredRoleForPath } from "../src/lib/auth/access";

describe("admin data helpers", () => {
  it("builds admin query strings without unsupported empty values", () => {
    expect(
      buildAdminQuery({
        page: 2,
        q: "áo",
        status: "all",
        approvalStatus: "PENDING",
        empty: "",
      }),
    ).toBe("?page=2&q=%C3%A1o&approvalStatus=PENDING");
  });

  it("normalizes product envelopes and pagination metadata", () => {
    const result = normalizeAdminProducts({
      data: {
        products: [
          {
            id: "p1",
            sku: "SKU-1",
            name: "Áo thun",
            slug: "ao-thun",
            price: "120000",
            status: "ACTIVE",
            approvalStatus: "APPROVED",
            category: { id: "c1", name: "Thời trang" },
            inventoryItem: { stockQuantity: 9, reservedQuantity: 2 },
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    });

    expect(result.meta.total).toBe(1);
    expect(result.items[0]).toMatchObject({
      id: "p1",
      sku: "SKU-1",
      categoryName: "Thời trang",
      inventory: { stockQuantity: 9, reservedQuantity: 2, availableQuantity: 7 },
    });
  });

  it("normalizes category hierarchy and voucher status", () => {
    expect(
      normalizeAdminCategories({
        data: [
          {
            id: "c1",
            name: "Cha",
            slug: "cha",
            status: "ACTIVE",
            children: [{ id: "c2", name: "Con", slug: "con" }],
          },
        ],
      })[0].children[0].name,
    ).toBe("Con");

    expect(
      normalizeAdminVouchers({
        data: [{ id: "v1", code: "SALE10", discountValue: 10, active: false }],
      }).items[0],
    ).toMatchObject({ code: "SALE10", status: "INACTIVE", active: false });
  });

  it("maps known and unknown statuses predictably", () => {
    expect(adminStatus.product("ACTIVE")).toEqual({
      label: "Đang bán",
      tone: "green",
    });
    expect(adminStatus.payment("custom_status")).toEqual({
      label: "custom_status",
      tone: "slate",
    });
  });

  it("documents backend mutation support boundaries", () => {
    expect(adminMutationSupport.products).toBe(true);
    expect(adminMutationSupport.categories).toBe(true);
    expect(adminMutationSupport.vouchers).toBe(true);
    expect(adminMutationSupport.orderStatus).toBe(false);
    expect(adminMutationSupport.customerStatus).toBe(false);
    expect(adminMutationSupport.inventoryStandalone).toBe(false);
  });
});

describe("admin route protection assumptions", () => {
  it("requires admin role for nested admin routes", () => {
    expect(requiredRoleForPath("/admin")).toBe("admin");
    expect(requiredRoleForPath("/admin/products")).toBe("admin");
    expect(requiredRoleForPath("/admin/orders/o1")).toBe("admin");
  });
});
