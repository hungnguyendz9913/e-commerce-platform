## 1. Voucher E2E Test Structure

- [x] 1.1 Inspect current `VoucherController`, `VoucherService`, and voucher DTO exports to confirm method names, route metadata, and validation decorators used by the API boundary.
- [x] 1.2 Create `apps/api-e2e/src/api/vouchers` for voucher API E2E specs, fixtures, and helpers.
- [x] 1.3 Add voucher fixtures for voucher ids, product/category ids, active voucher response data, list response data, create payloads, update payloads, query parameters, and deactivate success data.
- [x] 1.4 Add voucher API E2E helpers for creating a mocked `VoucherService`, resetting mock calls, counting mock calls, starting an isolated Nest test app with `VoucherController`, and closing test resources.

## 2. Public Voucher Discovery Coverage

- [x] 2.1 Add a Playwright API test for `GET /vouchers/products/{productId}` returning `200 OK`, a voucher `data` envelope, and delegating with the route `productId`.
- [x] 2.2 Add a Playwright API test for `GET /vouchers/categories/{categoryId}` returning `200 OK`, a voucher `data` envelope, and delegating with the route `categoryId`.
- [x] 2.3 Verify public voucher discovery routes do not require authentication headers.

## 3. Admin Route Protection

- [x] 3.1 Verify `VoucherController` applies admin authentication and role guards for every admin voucher endpoint; add minimal guard metadata if the current controller does not enforce the existing admin-only requirement.
- [x] 3.2 Add E2E tests proving guest requests to `POST /admin/vouchers`, `GET /admin/vouchers`, `GET /admin/vouchers/{voucherId}`, `PATCH /admin/vouchers/{voucherId}`, and `PATCH /admin/vouchers/{voucherId}/deactivate` return unauthenticated errors without calling `VoucherService`.
- [x] 3.3 Add E2E tests proving authenticated customer requests to the same admin endpoints return forbidden errors without calling `VoucherService`.

## 4. Admin Voucher Endpoint Success Coverage

- [x] 4.1 Add a Playwright API test for authenticated admin `POST /admin/vouchers` returning `201 Created`, a voucher `data` envelope, and delegating with the create voucher DTO.
- [x] 4.2 Add a Playwright API test for authenticated admin `GET /admin/vouchers` returning `200 OK`, a voucher list `data` envelope, and delegating with parsed query parameters.
- [x] 4.3 Add a Playwright API test for authenticated admin `GET /admin/vouchers/{voucherId}` returning `200 OK`, a voucher `data` envelope, and delegating with the route `voucherId`.
- [x] 4.4 Add a Playwright API test for authenticated admin `PATCH /admin/vouchers/{voucherId}` returning `200 OK`, a voucher `data` envelope, and delegating with `voucherId` plus the update voucher DTO.
- [x] 4.5 Add a Playwright API test for authenticated admin `PATCH /admin/vouchers/{voucherId}/deactivate` returning `200 OK`, a voucher or success `data` envelope, and delegating with the route `voucherId`.

## 5. Validation Coverage

- [x] 5.1 Add E2E tests proving `POST /admin/vouchers` rejects missing required fields, invalid discount values, and invalid date values before `VoucherService.createVoucher` is called.
- [x] 5.2 Add E2E tests proving `PATCH /admin/vouchers/{voucherId}` rejects invalid update fields before `VoucherService.updateVoucherBeforeStart` is called.
- [x] 5.3 Add E2E tests proving `GET /admin/vouchers` rejects invalid pagination, sorting, or filter query values before `VoucherService.findAllVouchers` is called.

## 6. Verification

- [x] 6.1 Run `npx nx e2e api-e2e` and fix voucher E2E failures.
- [x] 6.2 Run relevant lint or typecheck command for the affected API/API-E2E projects if available.
- [x] 6.3 Validate the OpenSpec change with `openspec validate add-voucher-api-e2e-tests --strict`.
