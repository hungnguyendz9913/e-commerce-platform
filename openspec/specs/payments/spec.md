# Payments Specification

## Purpose

Define payment creation, status lookup, provider adapter behavior, verified webhooks, idempotency, and payment/order status synchronization.

## Requirements

### Requirement: Create payment

The system SHALL create a payment request for an order using a supported payment provider and method.

#### Scenario: Create payment for own order

- GIVEN an authenticated customer owns an unpaid order
- WHEN `POST /payments/create` is called with a supported method
- THEN the system creates a payment record
- AND returns provider payment data such as a redirect URL or client-safe payment data.

### Requirement: Get payment status

The system SHALL allow payment status lookup for authorized users.

#### Scenario: Customer checks payment status

- GIVEN a payment belongs to the authenticated customer's order
- WHEN `GET /payments/{paymentId}/status` is called
- THEN the system returns payment status without provider secrets.

### Requirement: Payment provider adapter

The system SHALL isolate gateway-specific logic behind a payment provider adapter.

#### Scenario: Provider-specific payment creation

- GIVEN the configured provider is Stripe, PayPal, VNPay, MoMo, COD, or another approved provider
- WHEN payment creation is requested
- THEN the payment service delegates provider-specific behavior to the adapter.

### Requirement: Webhook signature verification

The system SHALL verify payment webhook signatures before processing provider events.

#### Scenario: Invalid webhook signature

- GIVEN a webhook request has an invalid or missing provider signature
- WHEN `POST /payments/webhook/{provider}` is called
- THEN the system rejects the request
- AND does not update payment or order status.

### Requirement: Webhook idempotency

The system SHALL process each external webhook event id at most once.

#### Scenario: Duplicate webhook event

- GIVEN a webhook event with the same provider external event id was already processed
- WHEN the duplicate webhook is received
- THEN the system returns a safe idempotent response
- AND does not apply payment/order state changes again.

### Requirement: Payment and order status updates

The system SHALL update payment status and related order payment status from verified provider events.

#### Scenario: Payment succeeded webhook

- GIVEN a verified payment succeeded event is received
- WHEN the event is processed
- THEN the system marks the payment succeeded
- AND updates the order payment status consistently.
