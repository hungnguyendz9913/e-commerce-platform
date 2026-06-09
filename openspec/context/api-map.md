# API Map

## API Conventions

- API style: REST JSON.
- Local base URL: `http://localhost:3000/api`.
- Request body format: `application/json`.
- Authentication: Bearer token or secure cookie session depending on implementation.
- Timestamps: ISO 8601.
- Default currency: `VND` unless configured otherwise.

## Success Format

Single resource responses:

```json
{
  "data": {},
  "meta": {}
}
```

List responses:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "details": [
      {
        "field": "email",
        "message": "Email is required."
      }
    ]
  }
}
```

Common error codes: `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `BUSINESS_RULE_VIOLATION`, `PAYMENT_ERROR`, and `INTERNAL_SERVER_ERROR`.

## Pagination, Filtering, Sorting

- Pagination uses `page` and `limit`, defaulting to page `1` and limit `20`.
- Sorting uses `sortBy` and `sortOrder` (`asc` or `desc`).
- Product filters include `q`, `categoryId`, `minPrice`, `maxPrice`, `inStock`, and admin-only `status` and `approvalStatus`.

## Access Levels

- Public: no authentication required.
- Customer: authenticated customer account.
- Admin: authenticated admin role.
- Gateway: valid payment gateway signature.

## Endpoint Groups

- Auth `/auth`: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`; current code also includes `POST /auth/refresh`, `POST /auth/forgot-password`, and `POST /auth/reset-password`.
- Profile `/users/me`: `GET /users/me`, `PATCH /users/me`, `GET /users/me/addresses`, `POST /users/me/addresses`.
- Products `/products`: `GET /products`, `GET /products/{id}`.
- Categories `/categories`: `GET /categories`.
- Cart `/cart`: `GET /cart`, `POST /cart/items`, `PATCH /cart/items/{itemId}`, `DELETE /cart/items/{itemId}`, `DELETE /cart`.
- Checkout `/checkout`: `POST /checkout/validate`, `POST /checkout`, `POST /checkout/voucher`.
- Orders `/orders`: `GET /orders`, `GET /orders/{orderId}`, `POST /orders/{orderId}/cancel`.
- Payments `/payments`: `POST /payments/create`, `GET /payments/{paymentId}/status`, `POST /payments/webhook/{provider}`.
- Admin `/admin`: dashboard, products, inventory, orders, customers, approvals, and revenue endpoints.
