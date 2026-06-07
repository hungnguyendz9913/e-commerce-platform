# API Documentation

## Fullstack E-commerce Platform with TypeScript

**Version:** 1.0  
**Project Code:** ECOM-TS  
**Document Code:** ECOM-TS_API_1.0.md  
**Date:** 08/06/2026  
**API Style:** RESTful JSON API  
**Backend:** NestJS  
**Frontend Consumer:** Next.js  
**Testing:** Playwright E2E and API integration tests  

---

## Revision History

| Date | Version | A/M/D | Description | Author |
| :--- | :--- | :---: | :--- | :--- |
| 08/06/2026 | 1.0 | A | Initial API documentation based on SRS, Use-Case Specification, and Software Design Document | Nguyen Hung Nguyen |

> A: Added; M: Modified; D: Deleted

---

## Table of Contents

1. [Overview](#1-overview)  
2. [API Conventions](#2-api-conventions)  
3. [Authentication](#3-authentication)  
4. [Error Handling](#4-error-handling)  
5. [Pagination, Filtering, and Sorting](#5-pagination-filtering-and-sorting)  
6. [Authentication APIs](#6-authentication-apis)  
7. [Profile APIs](#7-profile-apis)  
8. [Product and Category APIs](#8-product-and-category-apis)  
9. [Cart APIs](#9-cart-apis)  
10. [Checkout APIs](#10-checkout-apis)  
11. [Order APIs](#11-order-apis)  
12. [Payment APIs](#12-payment-apis)  
13. [Admin APIs](#13-admin-apis)  
14. [Webhook APIs](#14-webhook-apis)  
15. [DTO Reference](#15-dto-reference)  
16. [Status Codes](#16-status-codes)  
17. [Appendix](#17-appendix)

---

# 1. Overview

This document defines the REST API contract for the Fullstack E-commerce Platform with TypeScript. The backend is implemented using NestJS and consumed by the Next.js frontend. The API supports customer-facing storefront workflows, checkout, payment integration, order management, and admin dashboard operations.

## 1.1 Base URL

| Environment | Base URL |
| :--- | :--- |
| Local | `http://localhost:3000/api` |
| Staging | `https://staging.example.com/api` |
| Production | `https://example.com/api` |

The actual deployed domain should be updated during deployment.

## 1.2 API Groups

| Group | Prefix | Access |
| :--- | :--- | :--- |
| Auth | `/auth` | Public/authenticated |
| Profile | `/users/me` | Customer/Admin |
| Products | `/products` | Public read |
| Categories | `/categories` | Public read |
| Cart | `/cart` | Customer |
| Checkout | `/checkout` | Customer |
| Orders | `/orders` | Customer |
| Payments | `/payments` | Customer/Gateway |
| Admin | `/admin` | Admin |

---

# 2. API Conventions

## 2.1 Request Format

- Request body format: JSON.
- Content type: `application/json`.
- Authentication: Bearer token or secure cookie session depending on implementation.

## 2.2 Success Response Format

```json
{
  "data": {},
  "meta": {}
}
```

For list endpoints:

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

## 2.3 Error Response Format

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

## 2.4 Date and Time

All timestamps should use ISO 8601 format.

```text
2026-06-08T10:00:00.000Z
```

## 2.5 Currency

Monetary values should be represented as numbers in the smallest safe decimal format supported by the backend/database. For Vietnam-focused payment gateways, `VND` is expected as the default currency unless otherwise configured.

---

# 3. Authentication

## 3.1 Authentication Header

If Bearer token authentication is used:

```http
Authorization: Bearer <access_token>
```

## 3.2 Roles

| Role | Description |
| :--- | :--- |
| guest | Unauthenticated user. |
| customer | Authenticated customer. |
| admin | Administrative user. |

## 3.3 Access Control

| Access Level | Description |
| :--- | :--- |
| Public | No authentication required. |
| Customer | Requires authenticated customer account. |
| Admin | Requires authenticated admin account. |
| Gateway | Requires valid payment webhook signature. |

---

# 4. Error Handling

## 4.1 Common Error Codes

| Code | HTTP Status | Description |
| :--- | :---: | :--- |
| VALIDATION_ERROR | 400 | Request data is invalid. |
| UNAUTHENTICATED | 401 | Authentication is required or token is invalid. |
| FORBIDDEN | 403 | User does not have permission. |
| NOT_FOUND | 404 | Requested resource does not exist. |
| CONFLICT | 409 | Resource conflict, such as duplicate email or SKU. |
| BUSINESS_RULE_VIOLATION | 422 | Request violates business rules. |
| PAYMENT_ERROR | 422 | Payment processing failed. |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error. |

## 4.2 Example Validation Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "details": [
      {
        "field": "password",
        "message": "Password must contain at least 8 characters."
      }
    ]
  }
}
```

---

# 5. Pagination, Filtering, and Sorting

## 5.1 Pagination Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| page | number | 1 | Page number. |
| limit | number | 20 | Items per page. |

## 5.2 Sorting Parameters

| Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| sortBy | string | `price` | Field to sort by. |
| sortOrder | string | `asc` or `desc` | Sort direction. |

## 5.3 Product Filtering Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| q | string | Search keyword. |
| categoryId | uuid | Filter by category. |
| minPrice | number | Minimum product price. |
| maxPrice | number | Maximum product price. |
| inStock | boolean | Filter by availability. |
| status | string | Admin-only product status filter. |
| approvalStatus | string | Admin-only approval status filter. |

---

# 6. Authentication APIs

## 6.1 Register Account

### `POST /auth/register`

Creates a new customer account.

**Access:** Public

### Request Body

```json
{
  "email": "customer@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "fullName": "Nguyen Van A",
  "phone": "0900000000"
}
```

### Success Response `201 Created`

```json
{
  "data": {
    "id": "usr_123",
    "email": "customer@example.com",
    "fullName": "Nguyen Van A",
    "role": "customer",
    "status": "active",
    "createdAt": "2026-06-08T10:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Description |
| :---: | :--- | :--- |
| 400 | VALIDATION_ERROR | Invalid registration data. |
| 409 | CONFLICT | Email already exists. |

---

## 6.2 Sign In

### `POST /auth/login`

Authenticates a user and returns session/token information.

**Access:** Public

### Request Body

```json
{
  "email": "customer@example.com",
  "password": "Password123!"
}
```

### Success Response `200 OK`

```json
{
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": "usr_123",
      "email": "customer@example.com",
      "fullName": "Nguyen Van A",
      "roles": ["customer"]
    }
  }
}
```

### Error Responses

| Status | Code | Description |
| :---: | :--- | :--- |
| 400 | VALIDATION_ERROR | Missing email or password. |
| 401 | UNAUTHENTICATED | Invalid credentials. |

---

## 6.3 Sign Out

### `POST /auth/logout`

Invalidates the current authenticated session.

**Access:** Customer/Admin

### Success Response `200 OK`

```json
{
  "data": {
    "success": true
  }
}
```

---

## 6.4 Get Current User

### `GET /auth/me`

Returns the current authenticated user.

**Access:** Customer/Admin

### Success Response `200 OK`

```json
{
  "data": {
    "id": "usr_123",
    "email": "customer@example.com",
    "fullName": "Nguyen Van A",
    "phone": "0900000000",
    "roles": ["customer"],
    "status": "active"
  }
}
```

---

# 7. Profile APIs

## 7.1 Get My Profile

### `GET /users/me`

Returns the authenticated user's profile.

**Access:** Customer/Admin

### Success Response `200 OK`

```json
{
  "data": {
    "id": "usr_123",
    "email": "customer@example.com",
    "fullName": "Nguyen Van A",
    "phone": "0900000000",
    "avatarUrl": null,
    "status": "active"
  }
}
```

---

## 7.2 Update My Profile

### `PATCH /users/me`

Updates the authenticated user's profile.

**Access:** Customer/Admin

### Request Body

```json
{
  "fullName": "Nguyen Van A Updated",
  "phone": "0911111111",
  "avatarUrl": "https://example.com/avatar.png"
}
```

### Success Response `200 OK`

```json
{
  "data": {
    "id": "usr_123",
    "email": "customer@example.com",
    "fullName": "Nguyen Van A Updated",
    "phone": "0911111111",
    "avatarUrl": "https://example.com/avatar.png"
  }
}
```

---

## 7.3 Manage Addresses

### `GET /users/me/addresses`

Returns saved delivery addresses.

**Access:** Customer

### Success Response `200 OK`

```json
{
  "data": [
    {
      "id": "addr_123",
      "recipientName": "Nguyen Van A",
      "phone": "0900000000",
      "addressLine": "123 Nguyen Trai",
      "ward": "Ward 1",
      "district": "District 5",
      "city": "Ho Chi Minh City",
      "country": "Vietnam",
      "isDefault": true
    }
  ]
}
```

### `POST /users/me/addresses`

Creates a new delivery address.

**Access:** Customer

### Request Body

```json
{
  "recipientName": "Nguyen Van A",
  "phone": "0900000000",
  "addressLine": "123 Nguyen Trai",
  "ward": "Ward 1",
  "district": "District 5",
  "city": "Ho Chi Minh City",
  "country": "Vietnam",
  "isDefault": true
}
```

---

# 8. Product and Category APIs

## 8.1 List Products

### `GET /products`

Returns public products with search, filter, sorting, and pagination.

**Access:** Public

### Query Parameters

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| q | string | No | Search keyword. |
| categoryId | uuid | No | Category filter. |
| minPrice | number | No | Minimum price. |
| maxPrice | number | No | Maximum price. |
| inStock | boolean | No | Whether product is in stock. |
| page | number | No | Page number. |
| limit | number | No | Items per page. |
| sortBy | string | No | price, name, createdAt. |
| sortOrder | string | No | asc or desc. |

### Success Response `200 OK`

```json
{
  "data": [
    {
      "id": "prd_123",
      "name": "Wireless Keyboard",
      "slug": "wireless-keyboard",
      "price": 350000,
      "thumbnailUrl": "https://example.com/keyboard.png",
      "category": {
        "id": "cat_123",
        "name": "Accessories"
      },
      "inStock": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 8.2 Get Product Detail

### `GET /products/{id}`

Returns detail of a product.

**Access:** Public

### Success Response `200 OK`

```json
{
  "data": {
    "id": "prd_123",
    "sku": "KB-001",
    "name": "Wireless Keyboard",
    "slug": "wireless-keyboard",
    "description": "Compact wireless keyboard.",
    "price": 350000,
    "category": {
      "id": "cat_123",
      "name": "Accessories"
    },
    "images": [
      {
        "id": "img_123",
        "imageUrl": "https://example.com/keyboard.png",
        "altText": "Wireless Keyboard",
        "isPrimary": true
      }
    ],
    "stockQuantity": 20,
    "inStock": true
  }
}
```

### Error Responses

| Status | Code | Description |
| :---: | :--- | :--- |
| 404 | NOT_FOUND | Product does not exist or is not visible. |

---

## 8.3 List Categories

### `GET /categories`

Returns active product categories.

**Access:** Public

### Success Response `200 OK`

```json
{
  "data": [
    {
      "id": "cat_123",
      "name": "Accessories",
      "slug": "accessories",
      "parentId": null
    }
  ]
}
```

---

# 9. Cart APIs

## 9.1 Get Current Cart

### `GET /cart`

Returns the authenticated customer's active cart.

**Access:** Customer

### Success Response `200 OK`

```json
{
  "data": {
    "id": "cart_123",
    "items": [
      {
        "id": "ci_123",
        "productId": "prd_123",
        "name": "Wireless Keyboard",
        "quantity": 2,
        "unitPrice": 350000,
        "totalPrice": 700000,
        "inStock": true
      }
    ],
    "subtotalAmount": 700000,
    "discountAmount": 0,
    "shippingFee": 0,
    "totalAmount": 700000
  }
}
```

---

## 9.2 Add Item to Cart

### `POST /cart/items`

Adds a product to cart or increases quantity if already present.

**Access:** Customer

### Request Body

```json
{
  "productId": "prd_123",
  "quantity": 1
}
```

### Success Response `201 Created`

```json
{
  "data": {
    "id": "ci_123",
    "productId": "prd_123",
    "quantity": 1,
    "unitPrice": 350000,
    "totalPrice": 350000
  }
}
```

### Error Responses

| Status | Code | Description |
| :---: | :--- | :--- |
| 404 | NOT_FOUND | Product not found. |
| 422 | BUSINESS_RULE_VIOLATION | Product out of stock or quantity exceeds stock. |

---

## 9.3 Update Cart Item Quantity

### `PATCH /cart/items/{itemId}`

Updates quantity of a cart item.

**Access:** Customer

### Request Body

```json
{
  "quantity": 3
}
```

### Success Response `200 OK`

```json
{
  "data": {
    "id": "ci_123",
    "quantity": 3,
    "unitPrice": 350000,
    "totalPrice": 1050000
  }
}
```

---

## 9.4 Remove Cart Item

### `DELETE /cart/items/{itemId}`

Removes a cart item.

**Access:** Customer

### Success Response `200 OK`

```json
{
  "data": {
    "success": true
  }
}
```

---

## 9.5 Clear Cart

### `DELETE /cart`

Clears all items in the active cart.

**Access:** Customer

### Success Response `200 OK`

```json
{
  "data": {
    "success": true
  }
}
```

---

# 10. Checkout APIs

## 10.1 Validate Checkout

### `POST /checkout/validate`

Validates cart, delivery information, voucher, and selected payment method before final checkout.

**Access:** Customer

### Request Body

```json
{
  "deliveryInfo": {
    "recipientName": "Nguyen Van A",
    "phone": "0900000000",
    "addressLine": "123 Nguyen Trai",
    "ward": "Ward 1",
    "district": "District 5",
    "city": "Ho Chi Minh City",
    "country": "Vietnam"
  },
  "voucherCode": "SALE10",
  "paymentMethod": "momo"
}
```

### Success Response `200 OK`

```json
{
  "data": {
    "valid": true,
    "summary": {
      "subtotalAmount": 1000000,
      "discountAmount": 100000,
      "shippingFee": 30000,
      "taxAmount": 0,
      "totalAmount": 930000
    }
  }
}
```

---

## 10.2 Create Order from Checkout

### `POST /checkout`

Creates an order from the current cart and begins payment if required.

**Access:** Customer

### Request Body

```json
{
  "deliveryInfo": {
    "recipientName": "Nguyen Van A",
    "phone": "0900000000",
    "addressLine": "123 Nguyen Trai",
    "ward": "Ward 1",
    "district": "District 5",
    "city": "Ho Chi Minh City",
    "country": "Vietnam"
  },
  "voucherCode": "SALE10",
  "paymentMethod": "momo"
}
```

### Success Response `201 Created`

```json
{
  "data": {
    "order": {
      "id": "ord_123",
      "orderNumber": "ECOM-20260608-0001",
      "status": "pending",
      "paymentStatus": "pending",
      "totalAmount": 930000
    },
    "payment": {
      "id": "pay_123",
      "provider": "momo",
      "status": "pending",
      "paymentUrl": "https://payment.example.com/session/abc"
    }
  }
}
```

### Error Responses

| Status | Code | Description |
| :---: | :--- | :--- |
| 400 | VALIDATION_ERROR | Invalid delivery or checkout data. |
| 422 | BUSINESS_RULE_VIOLATION | Empty cart, invalid voucher, or insufficient stock. |

---

## 10.3 Apply Voucher

### `POST /checkout/voucher`

Validates and applies a voucher to the current checkout summary.

**Access:** Customer

### Request Body

```json
{
  "voucherCode": "SALE10"
}
```

### Success Response `200 OK`

```json
{
  "data": {
    "voucherCode": "SALE10",
    "discountAmount": 100000,
    "summary": {
      "subtotalAmount": 1000000,
      "discountAmount": 100000,
      "shippingFee": 30000,
      "totalAmount": 930000
    }
  }
}
```

---

# 11. Order APIs

## 11.1 List My Orders

### `GET /orders`

Returns order history for the authenticated customer.

**Access:** Customer

### Query Parameters

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| status | string | No | Filter by order status. |
| page | number | No | Page number. |
| limit | number | No | Items per page. |

### Success Response `200 OK`

```json
{
  "data": [
    {
      "id": "ord_123",
      "orderNumber": "ECOM-20260608-0001",
      "status": "pending",
      "paymentStatus": "pending",
      "totalAmount": 930000,
      "createdAt": "2026-06-08T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 11.2 Get My Order Detail

### `GET /orders/{orderId}`

Returns details of an order owned by the authenticated customer.

**Access:** Customer

### Success Response `200 OK`

```json
{
  "data": {
    "id": "ord_123",
    "orderNumber": "ECOM-20260608-0001",
    "status": "pending",
    "paymentStatus": "pending",
    "items": [
      {
        "productId": "prd_123",
        "productName": "Wireless Keyboard",
        "sku": "KB-001",
        "quantity": 2,
        "unitPrice": 350000,
        "totalPrice": 700000
      }
    ],
    "subtotalAmount": 1000000,
    "discountAmount": 100000,
    "shippingFee": 30000,
    "taxAmount": 0,
    "totalAmount": 930000,
    "shippingAddress": "123 Nguyen Trai, Ward 1, District 5, Ho Chi Minh City, Vietnam",
    "createdAt": "2026-06-08T10:00:00.000Z"
  }
}
```

---

## 11.3 Cancel My Order

### `POST /orders/{orderId}/cancel`

Requests cancellation for an eligible customer order.

**Access:** Customer

### Request Body

```json
{
  "reason": "I placed the wrong order."
}
```

### Success Response `200 OK`

```json
{
  "data": {
    "id": "ord_123",
    "status": "canceled"
  }
}
```

### Error Responses

| Status | Code | Description |
| :---: | :--- | :--- |
| 403 | FORBIDDEN | Order does not belong to current customer. |
| 422 | BUSINESS_RULE_VIOLATION | Order cannot be canceled in current status. |

---

# 12. Payment APIs

## 12.1 Create Payment

### `POST /payments/create`

Creates a payment request for an existing order.

**Access:** Customer

### Request Body

```json
{
  "orderId": "ord_123",
  "provider": "momo",
  "method": "wallet"
}
```

### Success Response `201 Created`

```json
{
  "data": {
    "id": "pay_123",
    "orderId": "ord_123",
    "provider": "momo",
    "method": "wallet",
    "status": "pending",
    "amount": 930000,
    "currency": "VND",
    "paymentUrl": "https://payment.example.com/session/abc"
  }
}
```

---

## 12.2 Get Payment Status

### `GET /payments/{paymentId}/status`

Returns payment status for an authenticated customer's payment.

**Access:** Customer

### Success Response `200 OK`

```json
{
  "data": {
    "id": "pay_123",
    "orderId": "ord_123",
    "status": "succeeded",
    "provider": "momo",
    "amount": 930000,
    "currency": "VND",
    "updatedAt": "2026-06-08T10:05:00.000Z"
  }
}
```

---

# 13. Admin APIs

All endpoints in this section require the admin role.

## 13.1 Admin Dashboard

### `GET /admin/dashboard`

Returns dashboard summary metrics.

**Access:** Admin

### Query Parameters

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| from | string | No | Start date. |
| to | string | No | End date. |

### Success Response `200 OK`

```json
{
  "data": {
    "totalRevenue": 25000000,
    "totalOrders": 120,
    "totalCustomers": 80,
    "pendingOrders": 10,
    "lowStockProducts": 5
  }
}
```

---

## 13.2 List Admin Products

### `GET /admin/products`

Returns products for admin management.

**Access:** Admin

### Query Parameters

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| q | string | No | Search keyword. |
| categoryId | uuid | No | Category filter. |
| status | string | No | Product status. |
| approvalStatus | string | No | Approval status. |
| page | number | No | Page number. |
| limit | number | No | Items per page. |

---

## 13.3 Create Product

### `POST /admin/products`

Creates a new product.

**Access:** Admin

### Request Body

```json
{
  "categoryId": "cat_123",
  "sku": "KB-001",
  "name": "Wireless Keyboard",
  "slug": "wireless-keyboard",
  "description": "Compact wireless keyboard.",
  "price": 350000,
  "status": "active",
  "approvalStatus": "approved",
  "images": [
    {
      "imageUrl": "https://example.com/keyboard.png",
      "altText": "Wireless Keyboard",
      "isPrimary": true,
      "sortOrder": 1
    }
  ],
  "initialStock": 20
}
```

### Success Response `201 Created`

```json
{
  "data": {
    "id": "prd_123",
    "sku": "KB-001",
    "name": "Wireless Keyboard",
    "price": 350000,
    "status": "active",
    "approvalStatus": "approved",
    "stockQuantity": 20
  }
}
```

---

## 13.4 Update Product

### `PATCH /admin/products/{productId}`

Updates product information.

**Access:** Admin

### Request Body

```json
{
  "name": "Wireless Keyboard Pro",
  "description": "Updated description.",
  "price": 420000,
  "status": "active"
}
```

### Success Response `200 OK`

```json
{
  "data": {
    "id": "prd_123",
    "name": "Wireless Keyboard Pro",
    "price": 420000,
    "status": "active"
  }
}
```

---

## 13.5 Delete or Deactivate Product

### `DELETE /admin/products/{productId}`

Deletes or deactivates a product according to business rules.

**Access:** Admin

### Success Response `200 OK`

```json
{
  "data": {
    "success": true,
    "mode": "deactivated"
  }
}
```

---

## 13.6 Update Inventory

### `PATCH /admin/inventory/{productId}`

Updates stock quantity for a product.

**Access:** Admin

### Request Body

```json
{
  "quantity": 50,
  "reason": "Manual restock"
}
```

### Success Response `200 OK`

```json
{
  "data": {
    "productId": "prd_123",
    "stockQuantity": 50,
    "updatedAt": "2026-06-08T10:00:00.000Z"
  }
}
```

---

## 13.7 List Admin Orders

### `GET /admin/orders`

Returns all orders for admin management.

**Access:** Admin

### Query Parameters

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| q | string | No | Search by order number or customer. |
| status | string | No | Order status filter. |
| paymentStatus | string | No | Payment status filter. |
| from | string | No | Created date from. |
| to | string | No | Created date to. |
| page | number | No | Page number. |
| limit | number | No | Items per page. |

---

## 13.8 Update Order Status

### `PATCH /admin/orders/{orderId}/status`

Updates order status according to valid lifecycle transitions.

**Access:** Admin

### Request Body

```json
{
  "status": "processing",
  "note": "Order is being prepared."
}
```

### Success Response `200 OK`

```json
{
  "data": {
    "id": "ord_123",
    "status": "processing",
    "updatedAt": "2026-06-08T10:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Description |
| :---: | :--- | :--- |
| 422 | BUSINESS_RULE_VIOLATION | Invalid order status transition. |

---

## 13.9 List Customers

### `GET /admin/customers`

Returns customer records for admin management.

**Access:** Admin

### Query Parameters

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| q | string | No | Search by name, email, or phone. |
| status | string | No | Customer account status. |
| page | number | No | Page number. |
| limit | number | No | Items per page. |

---

## 13.10 Approve or Reject Product

### `PATCH /admin/products/{productId}/approval`

Updates product approval status.

**Access:** Admin

### Request Body

```json
{
  "approvalStatus": "approved",
  "reason": "Product information is valid."
}
```

### Success Response `200 OK`

```json
{
  "data": {
    "id": "prd_123",
    "approvalStatus": "approved"
  }
}
```

---

## 13.11 Revenue Metrics

### `GET /admin/revenue`

Returns revenue metrics.

**Access:** Admin

### Query Parameters

| Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| from | string | No | Start date. |
| to | string | No | End date. |
| groupBy | string | No | day, week, month. |

### Success Response `200 OK`

```json
{
  "data": {
    "totalRevenue": 25000000,
    "series": [
      {
        "period": "2026-06-08",
        "revenue": 5000000,
        "orders": 20
      }
    ]
  }
}
```

---

# 14. Webhook APIs

## 14.1 Payment Webhook

### `POST /payments/webhook/{provider}`

Receives payment gateway webhook events.

**Access:** Gateway signature verification required

### Path Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| provider | string | Payment provider, such as stripe, paypal, vnpay, or momo. |

### Headers

| Header | Required | Description |
| :--- | :---: | :--- |
| `x-payment-signature` | Yes | Gateway-specific signature header. |
| `x-payment-event-id` | Recommended | Gateway event identifier for idempotency. |

### Request Body

The request body depends on the selected payment gateway. The raw payload must be preserved for verification and audit.

### Success Response `200 OK`

```json
{
  "data": {
    "received": true,
    "processed": true
  }
}
```

### Error Responses

| Status | Code | Description |
| :---: | :--- | :--- |
| 400 | VALIDATION_ERROR | Malformed webhook payload. |
| 401 | UNAUTHENTICATED | Invalid webhook signature. |
| 409 | CONFLICT | Duplicate event if implementation chooses conflict response. |

---

# 15. DTO Reference

## 15.1 User DTO

```ts
export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  roles: string[];
  status: 'active' | 'inactive' | 'blocked';
}
```

## 15.2 Product DTO

```ts
export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  category: CategoryDto;
  images: ProductImageDto[];
  stockQuantity: number;
  inStock: boolean;
  status: 'active' | 'inactive' | 'archived';
  approvalStatus: 'pending' | 'approved' | 'rejected';
}
```

## 15.3 Cart DTO

```ts
export interface CartDto {
  id: string;
  items: CartItemDto[];
  subtotalAmount: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
}

export interface CartItemDto {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  inStock: boolean;
}
```

## 15.4 Order DTO

```ts
export interface OrderDto {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'refunded';
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  items: OrderItemDto[];
  subtotalAmount: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
}
```

## 15.5 Payment DTO

```ts
export interface PaymentDto {
  id: string;
  orderId: string;
  provider: 'stripe' | 'paypal' | 'vnpay' | 'momo' | 'cod';
  method: 'card' | 'wallet' | 'bank_transfer' | 'cod';
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  amount: number;
  currency: string;
  paymentUrl?: string | null;
  updatedAt: string;
}
```

---

# 16. Status Codes

| HTTP Status | Meaning | Typical Usage |
| :---: | :--- | :--- |
| 200 | OK | Successful read, update, delete, or action. |
| 201 | Created | Successful resource creation. |
| 204 | No Content | Successful action without body. |
| 400 | Bad Request | Invalid request structure. |
| 401 | Unauthorized | Missing or invalid authentication. |
| 403 | Forbidden | Authenticated but not permitted. |
| 404 | Not Found | Resource does not exist. |
| 409 | Conflict | Duplicate or conflicting resource state. |
| 422 | Unprocessable Entity | Business rule violation. |
| 500 | Internal Server Error | Unexpected server failure. |

---

# 17. Appendix

## 17.1 Order Status Transition Rules

| From | Allowed To |
| :--- | :--- |
| pending | processing, canceled, refunded |
| processing | shipped, canceled, refunded |
| shipped | delivered |
| delivered | refunded |
| canceled | None |
| refunded | None |

## 17.2 Payment Status Transition Rules

| From | Allowed To |
| :--- | :--- |
| pending | succeeded, failed, canceled |
| succeeded | refunded |
| failed | pending if retry is allowed |
| canceled | pending if retry is allowed |
| refunded | None |

## 17.3 Recommended Playwright API-related E2E Tests

| Test ID | Scenario | Main APIs |
| :--- | :--- | :--- |
| E2E-API-001 | Register and sign in customer | `/auth/register`, `/auth/login` |
| E2E-API-002 | Browse and filter products | `/products` |
| E2E-API-003 | Add item to cart | `/cart/items` |
| E2E-API-004 | Checkout successfully | `/checkout` |
| E2E-API-005 | Prevent overselling | `/checkout`, `/admin/inventory/{productId}` |
| E2E-API-006 | Process payment webhook idempotently | `/payments/webhook/{provider}` |
| E2E-API-007 | Admin updates order status | `/admin/orders/{orderId}/status` |
