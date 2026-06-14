import { RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RolesGuard } from '@e-commerce-platform/api-common';
import { Roles as RoleValues } from '@e-commerce-platform/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

describe('OrderController', () => {
  const orderService = {
    getMyOrderList: jest.fn(),
    getMyOrderDetail: jest.fn(),
    cancelMyOrder: jest.fn(),
  };
  let controller: OrderController;

  beforeEach(() => {
    jest.resetAllMocks();
    controller = new OrderController(orderService as unknown as OrderService);
  });

  it('should be mounted at /orders with customer guards', () => {
    const reflector = new Reflector();

    expect(Reflect.getMetadata(PATH_METADATA, OrderController)).toBe('orders');
    expect(Reflect.getMetadata(GUARDS_METADATA, OrderController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
    expect(
      reflector.getAllAndOverride<string[]>(ROLES_KEY, [OrderController]),
    ).toEqual([RoleValues.CUSTOMER]);
  });

  it('should expose customer order routes', () => {
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        OrderController.prototype.getMyOrderList,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        OrderController.prototype.getMyOrderList,
      ),
    ).toBe('/');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        OrderController.prototype.getMyOrderDetail,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        OrderController.prototype.getMyOrderDetail,
      ),
    ).toBe(':id');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        OrderController.prototype.cancelMyOrder,
      ),
    ).toBe(RequestMethod.POST);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        OrderController.prototype.cancelMyOrder,
      ),
    ).toBe(':id/cancel');
  });

  it('should delegate customer order routes to the service', async () => {
    const user = { userId: 'customer-id', sessionId: 'session-id', roles: [] };
    const query = { page: 1, limit: 10 };
    const cancelPayload = { reason: 'Changed mind' };

    orderService.getMyOrderList.mockResolvedValue({ data: [] });
    orderService.getMyOrderDetail.mockResolvedValue({ data: { id: 'o1' } });
    orderService.cancelMyOrder.mockResolvedValue({
      data: { id: 'o1', status: 'CANCELED' },
    });

    await expect(controller.getMyOrderList(user, query)).resolves.toEqual({
      data: [],
    });
    await expect(controller.getMyOrderDetail(user, 'o1')).resolves.toEqual({
      data: { id: 'o1' },
    });
    await expect(
      controller.cancelMyOrder(user, 'o1', cancelPayload),
    ).resolves.toEqual({
      data: { id: 'o1', status: 'CANCELED' },
    });

    expect(orderService.getMyOrderList).toHaveBeenCalledWith(
      'customer-id',
      query,
    );
    expect(orderService.getMyOrderDetail).toHaveBeenCalledWith(
      'customer-id',
      'o1',
    );
    expect(orderService.cancelMyOrder).toHaveBeenCalledWith(
      'customer-id',
      'o1',
      cancelPayload,
    );
  });
});
