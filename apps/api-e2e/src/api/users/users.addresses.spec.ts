import type { INestApplication } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { customerHeaders } from '../../support/api-test-app';
import {
  addressIds,
  defaultAddressFixture,
  deletedAddressFixture,
  updatedAddressFixture,
  updateAddressPayloadFixture,
} from './fixtures';
import {
  closeUserApiTestApp,
  createUserApiTestApp,
  createUserServiceMock,
  expectDataEnvelope,
  getUserServiceCallCount,
  resetUserServiceMock,
  type UserServiceMock,
} from './helpers';

test.describe('User Address API', () => {
  let app: INestApplication;
  let api: APIRequestContext;
  let userService: UserServiceMock;

  test.beforeAll(async () => {
    userService = createUserServiceMock();
    ({ app, api } = await createUserApiTestApp(userService));
  });

  test.beforeEach(() => {
    resetUserServiceMock(userService);
  });

  test.afterAll(async () => {
    await closeUserApiTestApp(app, api);
  });

  test('PATCH /users/me/addresses/{addressId} updates an address for the authenticated user', async () => {
    userService.updateMyAddress.mockResolvedValue({
      data: updatedAddressFixture,
    });

    const response = await api.patch(
      `/api/users/me/addresses/${addressIds.primary}`,
      {
        headers: customerHeaders,
        data: updateAddressPayloadFixture,
      },
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: addressIds.primary,
        recipientName: updateAddressPayloadFixture.recipientName,
        phone: updateAddressPayloadFixture.phone,
        addressLine: updateAddressPayloadFixture.addressLine,
        isDefault: false,
      }),
    );
    expect(userService.updateMyAddress.calls).toEqual([
      [
        'customer-id',
        addressIds.primary,
        expect.objectContaining(updateAddressPayloadFixture),
      ],
    ]);
  });

  test('DELETE /users/me/addresses/{addressId} deletes an address for the authenticated user', async () => {
    userService.deleteMyAddress.mockResolvedValue({
      data: deletedAddressFixture,
    });

    const response = await api.delete(
      `/api/users/me/addresses/${addressIds.primary}`,
      {
        headers: customerHeaders,
      },
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: addressIds.primary,
        recipientName: updateAddressPayloadFixture.recipientName,
      }),
    );
    expect(userService.deleteMyAddress.calls).toEqual([
      ['customer-id', addressIds.primary],
    ]);
  });

  test('PATCH /users/me/addresses/{addressId}/default sets an address as default for the authenticated user', async () => {
    userService.setMyAddressToDefault.mockResolvedValue({
      data: defaultAddressFixture,
    });

    const response = await api.patch(
      `/api/users/me/addresses/${addressIds.secondary}/default`,
      {
        headers: customerHeaders,
      },
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: addressIds.secondary,
        isDefault: true,
      }),
    );
    expect(userService.setMyAddressToDefault.calls).toEqual([
      ['customer-id', addressIds.secondary],
    ]);
  });

  for (const endpoint of [
    {
      method: 'patch',
      path: `/api/users/me/addresses/${addressIds.primary}`,
      data: updateAddressPayloadFixture,
    },
    {
      method: 'delete',
      path: `/api/users/me/addresses/${addressIds.primary}`,
    },
    {
      method: 'patch',
      path: `/api/users/me/addresses/${addressIds.secondary}/default`,
    },
  ] as const) {
    test(`guest cannot ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const response = await api[endpoint.method](endpoint.path, {
        data: endpoint.data,
      });

      expect(response.status()).toBe(401);
      expect(getUserServiceCallCount(userService)).toBe(0);
    });
  }
});
