import { DatabaseService } from "@e-commerce-platform/database";
import { Injectable } from "@nestjs/common";
import { CreateMyAddressDto } from "../../../../../libs/api/contracts/src/lib/addresses/create-address.dto";

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

  async createMyAddress(userId: string, dto: CreateMyAddressDto) {
    return this.databaseService.address.create({
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
}