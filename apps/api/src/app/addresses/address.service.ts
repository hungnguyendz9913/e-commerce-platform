import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AddressRepository } from './address.repository';
import { CreateMyAddressDto, UpdateMyAddressDto } from '@e-commerce-platform/api-contracts';
import { TransactionService } from '@e-commerce-platform/database';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository, private readonly transactionService: TransactionService) {}

  async getAddressesByUserId(userId: string) {
    return this.addressRepository.getAddressesByUserId(userId);
  }

  async createMyAddress(userId: string, dto: CreateMyAddressDto) {
    return this.transactionService.run(async (transaction) => {
      if (dto.isDefault) {
        await this.addressRepository.resetDefaultAddress(userId, transaction);
      }

      return this.addressRepository.createMyAddress(userId, dto, transaction);
    });
  }

  async updateMyAddress(userId: string, addressId: string, dto: UpdateMyAddressDto) {
    return this.transactionService.run(async (transaction) => {
      const currentAddress = await this.addressRepository.getAddressById(addressId, transaction);
      if (!currentAddress) {
        throw new NotFoundException('Address not found');
      }

      if (currentAddress.userId !== userId) {
        throw new ForbiddenException('You do not have permission to update this address');
      }

      if (dto.isDefault) {
        await this.addressRepository.resetDefaultAddress(userId, transaction);
      }

      return await this.addressRepository.updateMyAddress(userId, addressId, dto, transaction);
    });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    return this.transactionService.run(async (transaction) => {
      const currentAddress = await this.addressRepository.getAddressById(addressId, transaction);
      if (!currentAddress) {
        throw new NotFoundException('Address not found');
      }

      if (currentAddress.userId !== userId) {
        throw new ForbiddenException('You do not have permission to update this address');
      }

      await this.addressRepository.resetDefaultAddress(userId, transaction);
      return await this.addressRepository.setDefaultAddress(userId, addressId, transaction);
    });
  }

  async deleteMyAddress(userId: string, addressId: string) {
    return this.transactionService.run(async (transaction) => {
      const currentAddress = await this.addressRepository.getAddressById(addressId, transaction);
      if (!currentAddress) {
        throw new NotFoundException('Address not found');
      }

      if (currentAddress.userId !== userId) {
        throw new ForbiddenException('You do not have permission to update this address');
      }

      const deletedAddress = await this.addressRepository.deleteMyAddress(userId, addressId, transaction);

      if (currentAddress.isDefault) {
        const nextDefaultAddress = await this.addressRepository.findFirstAddressByUserId(userId, transaction);

        if (nextDefaultAddress) {
          await this.addressRepository.setDefaultAddress(userId, nextDefaultAddress.id, transaction);
        }
      }

      return deletedAddress;
    });
  }
}
