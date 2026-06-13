import { VoucherService } from './voucher.service';
import { VoucherRepository } from './voucher.repository';

describe('VoucherService', () => {
  let service: VoucherService;
  const voucherRepository = {
    findActiveVoucherForProduct: jest.fn(),
    findActiveVoucherForCategory: jest.fn(),
    createVoucher: jest.fn(),
    findAllVouchers: jest.fn(),
    findVoucherById: jest.fn(),
    updateVoucher: jest.fn(),
    deactivateVoucher: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new VoucherService(
      voucherRepository as unknown as VoucherRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate voucher operations to the repository', async () => {
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

    voucherRepository.findActiveVoucherForProduct.mockResolvedValue([
      { id: 'voucher-id' },
    ]);
    voucherRepository.findActiveVoucherForCategory.mockResolvedValue([
      { id: 'voucher-id' },
    ]);
    voucherRepository.createVoucher.mockResolvedValue({ id: 'voucher-id' });
    voucherRepository.findAllVouchers.mockResolvedValue({ data: [] });
    voucherRepository.findVoucherById.mockResolvedValue({ id: 'voucher-id' });
    voucherRepository.updateVoucher.mockResolvedValue({ id: 'voucher-id' });
    voucherRepository.deactivateVoucher.mockResolvedValue({ id: 'voucher-id' });

    await expect(
      service.findActiveVouchersForProduct('product-id'),
    ).resolves.toEqual([{ id: 'voucher-id' }]);
    await expect(
      service.findActiveVouchersForCategory('category-id'),
    ).resolves.toEqual([{ id: 'voucher-id' }]);
    await expect(service.createVoucher(createVoucherDto)).resolves.toEqual({
      id: 'voucher-id',
    });
    await expect(service.findAllVouchers(query)).resolves.toEqual({ data: [] });
    await expect(service.findVoucherById('voucher-id')).resolves.toEqual({
      id: 'voucher-id',
    });
    await expect(
      service.updateVoucherBeforeStart('voucher-id', updateVoucherDto),
    ).resolves.toEqual({ id: 'voucher-id' });
    await expect(service.deactivateVoucher('voucher-id')).resolves.toEqual({
      id: 'voucher-id',
    });

    expect(voucherRepository.findActiveVoucherForProduct).toHaveBeenCalledWith(
      'product-id',
    );
    expect(voucherRepository.findActiveVoucherForCategory).toHaveBeenCalledWith(
      'category-id',
    );
    expect(voucherRepository.createVoucher).toHaveBeenCalledWith(
      createVoucherDto,
    );
    expect(voucherRepository.findAllVouchers).toHaveBeenCalledWith(query);
    expect(voucherRepository.findVoucherById).toHaveBeenCalledWith(
      'voucher-id',
    );
    expect(voucherRepository.updateVoucher).toHaveBeenCalledWith(
      'voucher-id',
      updateVoucherDto,
    );
    expect(voucherRepository.deactivateVoucher).toHaveBeenCalledWith(
      'voucher-id',
    );
  });
});
