## Inventory and Classification

### Shared contract library

Move to `libs/api/contracts`:

- `apps/api/src/app/auth/dtos/forgot-password.dto.ts`
- `apps/api/src/app/auth/dtos/login.dto.ts`
- `apps/api/src/app/auth/dtos/refresh-token.dto.ts`
- `apps/api/src/app/auth/dtos/register.dto.ts`
- `apps/api/src/app/auth/dtos/reset-password.dto.ts`
- `apps/api/src/app/products/dtos/create-product.dto.ts`
- `apps/api/src/app/products/dtos/list-products-query.dto.ts`
- `apps/api/src/app/products/dtos/product-image.dto.ts`
- `apps/api/src/app/products/dtos/product-inventory.dto.ts`
- `apps/api/src/app/products/dtos/product.enums.ts`
- `apps/api/src/app/products/dtos/update-product.dto.ts`
- `apps/api/src/app/products/dtos/validators.ts`

### Shared common API helper library

Move to `libs/api/common`:

- `apps/api/src/app/auth/authenticated-user.ts`
- `apps/api/src/app/auth/decorators/current-user.decorator.ts`
- `apps/api/src/app/auth/decorators/roles.decorator.ts`
- `apps/api/src/app/auth/guards/roles.guard.ts`

### Module-private

Keep in `apps/api`:

- Controllers, modules, repositories, feature orchestration services, and tests.
- `apps/api/src/app/auth/guards/jwt-auth.guard.ts`, because it depends directly on `AuthService`.
- `apps/api/src/app/auth/services/password.service.ts`, because it is currently only used by auth flows.
- `apps/api/src/app/auth/services/token.service.ts`, because it is currently only used by auth/session flows.
- Product service private mapper/query helpers, because they depend on Prisma product relations and product module behavior.
