import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '@e-commerce-platform/database';
import { AddressService } from './address.service';
import { AddressRepository } from './address.repository';

describe('AddressService', () => {
  let service: AddressService;
  let addressRepository: {
    getAddressById: jest.Mock;
    updateMyAddress: jest.Mock;
    deleteMyAddress: jest.Mock;
    findFirstAddressByUserId: jest.Mock;
    setDefaultAddress: jest.Mock;
  };
  let transaction: { id: string };

  beforeEach(async () => {
    transaction = { id: 'transaction-client' };
    addressRepository = {
      getAddressById: jest.fn(),
      updateMyAddress: jest.fn(),
      deleteMyAddress: jest.fn(),
      findFirstAddressByUserId: jest.fn(),
      setDefaultAddress: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: AddressRepository,
          useValue: addressRepository,
        },
        {
          provide: TransactionService,
          useValue: {
            run: jest.fn((callback) => callback(transaction)),
          },
        },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update address inside the same transaction', async () => {
    const address = {
      id: 'address-id',
      userId: 'user-id',
      isDefault: false,
    };
    const dto = {
      recipientName: 'Nguyen Van B',
    };
    addressRepository.getAddressById.mockResolvedValue(address);
    addressRepository.updateMyAddress.mockResolvedValue({
      ...address,
      ...dto,
    });

    await service.updateMyAddress('user-id', 'address-id', dto);

    expect(addressRepository.updateMyAddress).toHaveBeenCalledWith(
      'user-id',
      'address-id',
      dto,
      transaction,
    );
  });

  it('should delete a non-default address without assigning a new default', async () => {
    const address = {
      id: 'address-id',
      userId: 'user-id',
      isDefault: false,
    };
    addressRepository.getAddressById.mockResolvedValue(address);
    addressRepository.deleteMyAddress.mockResolvedValue(address);

    await expect(service.deleteMyAddress('user-id', 'address-id')).resolves.toBe(address);

    expect(addressRepository.deleteMyAddress).toHaveBeenCalledWith(
      'user-id',
      'address-id',
      transaction,
    );
    expect(addressRepository.findFirstAddressByUserId).not.toHaveBeenCalled();
    expect(addressRepository.setDefaultAddress).not.toHaveBeenCalled();
  });

  it('should assign another address as default when deleting the current default address', async () => {
    const deletedAddress = {
      id: 'default-address-id',
      userId: 'user-id',
      isDefault: true,
    };
    const nextDefaultAddress = {
      id: 'next-address-id',
      userId: 'user-id',
      isDefault: false,
    };
    addressRepository.getAddressById.mockResolvedValue(deletedAddress);
    addressRepository.deleteMyAddress.mockResolvedValue(deletedAddress);
    addressRepository.findFirstAddressByUserId.mockResolvedValue(nextDefaultAddress);

    await expect(service.deleteMyAddress('user-id', 'default-address-id')).resolves.toBe(deletedAddress);

    expect(addressRepository.deleteMyAddress).toHaveBeenCalledWith(
      'user-id',
      'default-address-id',
      transaction,
    );
    expect(addressRepository.findFirstAddressByUserId).toHaveBeenCalledWith(
      'user-id',
      transaction,
    );
    expect(addressRepository.setDefaultAddress).toHaveBeenCalledWith(
      'user-id',
      'next-address-id',
      transaction,
    );
  });

  it('should allow deleting the only default address without assigning a new default', async () => {
    const deletedAddress = {
      id: 'default-address-id',
      userId: 'user-id',
      isDefault: true,
    };
    addressRepository.getAddressById.mockResolvedValue(deletedAddress);
    addressRepository.deleteMyAddress.mockResolvedValue(deletedAddress);
    addressRepository.findFirstAddressByUserId.mockResolvedValue(null);

    await expect(service.deleteMyAddress('user-id', 'default-address-id')).resolves.toBe(deletedAddress);

    expect(addressRepository.findFirstAddressByUserId).toHaveBeenCalledWith(
      'user-id',
      transaction,
    );
    expect(addressRepository.setDefaultAddress).not.toHaveBeenCalled();
  });
});
