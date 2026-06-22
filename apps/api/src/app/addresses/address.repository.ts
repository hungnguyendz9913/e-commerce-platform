import { DatabaseService, DbClient } from "@e-commerce-platform/database";
import { CreateMyAddressDto, UpdateMyAddressDto } from "@e-commerce-platform/api-contracts";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AddressRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAddressesByUserId(userId: string) {
    return this.databaseService.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async createMyAddress(userId: string, dto: CreateMyAddressDto, client: DbClient = this.databaseService) {
    return client.address.create({
      data: {
        userId,
        recipientName: dto.recipientName,
        phone: dto.phone,
        addressLine: dto.addressLine,
        ward: dto.ward,
        district: dto.district,
        city: dto.city,
        country: dto.country,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async updateMyAddress(userId: string, addressId: string, dto: UpdateMyAddressDto, client: DbClient = this.databaseService) {
    return client.address.update({
      where: {
        id: addressId,
        userId
      },
      data: {
        recipientName: dto.recipientName,
        phone: dto.phone,
        addressLine: dto.addressLine,
        ward: dto.ward,
        district: dto.district,
        city: dto.city,
        country: dto.country,
        isDefault: dto.isDefault ?? undefined,
      }
    })
  }

  async getAddressById(id: string, client: DbClient = this.databaseService) {
    return client.address.findFirst({
      where: { id }
    });
  }

  async resetDefaultAddress(userId: string, client: DbClient = this.databaseService) {
    return client.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
  }

  async setDefaultAddress(userId: string, id: string, client: DbClient = this.databaseService) {
    return client.address.update({
      where: {
        userId, id
      },
      data: { isDefault: true }
    })
  }

  async findFirstAddressByUserId(userId: string, client: DbClient = this.databaseService) {
    return client.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteMyAddress(userId: string, id: string, client: DbClient = this.databaseService) {
    return client.address.delete({
      where: {
        id, userId
      }
    });
  }
}
