import { expect, test } from '@playwright/test';

const publicRoutes = [
  { path: '/', heading: /Mua sắm thông minh/i },
  { path: '/products', heading: /Tất cả sản phẩm/i },
  { path: '/products/p1', heading: /iPhone 15 Pro/i },
  { path: '/login', heading: /Đăng nhập ShopVN/i },
  { path: '/register', heading: /Tạo tài khoản mới/i },
  { path: '/unauthorized', heading: /Bạn cần đăng nhập/i },
  { path: '/forbidden', heading: /Không có quyền truy cập/i },
  { path: '/missing-shopvn-page', heading: /Không tìm thấy trang/i },
];

const protectedRoutes = [
  '/cart',
  '/checkout',
  '/payment-result',
  '/customer',
  '/customer/profile',
  '/customer/addresses',
  '/customer/orders',
  '/admin',
  '/admin/products',
];

const viewportWidths = [320, 375, 768, 1024, 1536];

test.describe('ShopVN public responsive routes', () => {
  for (const route of publicRoutes) {
    for (const width of viewportWidths) {
      test(`${route.path} renders at ${width}px without document overflow`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route.path);

        await expect(page.getByRole('heading', { name: route.heading }).first()).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(hasHorizontalOverflow).toBe(false);
      });
    }
  }
});

test.describe('ShopVN protected route access', () => {
  for (const path of protectedRoutes) {
    test(`${path} routes guests to login safely`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/login\?redirectTo=/);
      await expect(page.getByRole('heading', { name: /Đăng nhập ShopVN/i })).toBeVisible();
    });
  }
});
