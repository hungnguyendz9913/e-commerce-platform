import { Injectable } from '@nestjs/common';
import { AddressRepository } from './address.repository';
import { CreateMyAddressDto } from '@e-commerce-platform/api-contracts';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async getAddressesByUserId(userId: string) {
    return this.addressRepository.getAddressesByUserId(userId);
  }

  async createMyAddress(userId: string, dto: CreateMyAddressDto) {
    return this.addressRepository.createMyAddress(userId, dto);
  }
}
