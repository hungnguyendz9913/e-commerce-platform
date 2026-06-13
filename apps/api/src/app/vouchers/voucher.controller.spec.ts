import { RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { ROLES_KEY, RolesGuard } from '@e-commerce-platform/api-common';
import { Roles as RoleValues } from '@e-commerce-platform/types';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('VoucherController', () => {
  let controller: VoucherController;
  const voucherService = {
    findActiveVouchersForProduct: jest.fn(),
    findActiveVouchersForCategory: jest.fn(),
    createVoucher: jest.fn(),
    findAllVouchers: jest.fn(),
    findVoucherById: jest.fn(),
    updateVoucherBeforeStart: jest.fn(),
    deactivateVoucher: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    controller = new VoucherController(
      voucherService as unknown as VoucherService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should expose public voucher lookup routes', () => {
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        VoucherController.prototype.findActiveVouchersForProduct,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        VoucherController.prototype.findActiveVouchersForProduct,
      ),
    ).toBe('vouchers/products/:productId');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        VoucherController.prototype.findActiveVouchersForCategory,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        VoucherController.prototype.findActiveVouchersForCategory,
      ),
    ).toBe('vouchers/categories/:categoryId');
  });

  it('should protect admin voucher routes', () => {
    for (const handler of [
      VoucherController.prototype.createVoucher,
      VoucherController.prototype.findAllVouchers,
      VoucherController.prototype.findVoucherById,
      VoucherController.prototype.updateVoucher,
      VoucherController.prototype.deactivateVoucher,
    ]) {
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([
        JwtAuthGuard,
        RolesGuard,
      ]);
      expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual([
        RoleValues.ADMIN,
      ]);
    }
  });

  it('should delegate voucher routes to the service', async () => {
    const createVoucherDto = {
      code: 'SUMMER25',
      discountType: 'percent',
      discountValue: 25,
    };
    const updateVoucherDto = {
      discountValue: 15,
    };
    const query = {
      q: 'sale',
      page: 1,
      limit: 20,
    };

    voucherService.findActiveVouchersForProduct.mockResolvedValue({
      data: [],
    });
    voucherService.findActiveVouchersForCategory.mockResolvedValue({
      data: [],
    });
    voucherService.createVoucher.mockResolvedValue({ data: { id: 'v1' } });
    voucherService.findAllVouchers.mockResolvedValue({ data: [] });
    voucherService.findVoucherById.mockResolvedValue({ data: { id: 'v1' } });
    voucherService.updateVoucherBeforeStart.mockResolvedValue({
      data: { id: 'v1' },
    });
    voucherService.deactivateVoucher.mockResolvedValue({
      data: { id: 'v1' },
    });

    await expect(
      controller.findActiveVouchersForProduct('product-id'),
    ).resolves.toEqual({ data: [] });
    await expect(
      controller.findActiveVouchersForCategory('category-id'),
    ).resolves.toEqual({ data: [] });
    await expect(controller.createVoucher(createVoucherDto)).resolves.toEqual({
      data: { id: 'v1' },
    });
    await expect(controller.findAllVouchers(query)).resolves.toEqual({
      data: [],
    });
    await expect(controller.findVoucherById('voucher-id')).resolves.toEqual({
      data: { id: 'v1' },
    });
    await expect(
      controller.updateVoucher('voucher-id', updateVoucherDto),
    ).resolves.toEqual({ data: { id: 'v1' } });
    await expect(controller.deactivateVoucher('voucher-id')).resolves.toEqual({
      data: { id: 'v1' },
    });

    expect(voucherService.findActiveVouchersForProduct).toHaveBeenCalledWith(
      'product-id',
    );
    expect(voucherService.findActiveVouchersForCategory).toHaveBeenCalledWith(
      'category-id',
    );
    expect(voucherService.createVoucher).toHaveBeenCalledWith(createVoucherDto);
    expect(voucherService.findAllVouchers).toHaveBeenCalledWith(query);
    expect(voucherService.findVoucherById).toHaveBeenCalledWith('voucher-id');
    expect(voucherService.updateVoucherBeforeStart).toHaveBeenCalledWith(
      'voucher-id',
      updateVoucherDto,
    );
    expect(voucherService.deactivateVoucher).toHaveBeenCalledWith('voucher-id');
  });
});
