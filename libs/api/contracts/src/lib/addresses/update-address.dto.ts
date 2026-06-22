import { CreateMyAddressDto } from "./create-address.dto.js";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateMyAddressDto extends PartialType(CreateMyAddressDto) {}