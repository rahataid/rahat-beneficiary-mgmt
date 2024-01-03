import { Injectable } from '@nestjs/common';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { PrismaService } from '@rahat/prisma';

@Injectable()
export class BeneficiariesService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateBeneficiaryDto) {
    if (dto.birthDate) {
      const formattedDate = new Date(dto.birthDate).toISOString();
      dto.birthDate = formattedDate;
    }
    return this.prisma.beneficiary.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
        birthDate: dto.birthDate,
        email: dto.email,
        extras: dto.extras,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        phone: dto.phone,
        notes: dto.notes,
      },
    });
  }

  async findAll() {
    return await this.prisma.beneficiary.findMany({});
  }

  async findOne(uuid: string) {
    return await this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
    });
  }

  async update(uuid: string, updateBeneficiaryDto: UpdateBeneficiaryDto) {
    return await this.prisma.beneficiary.update({
      where: {
        uuid,
      },
      data: updateBeneficiaryDto,
    });
  }

  async remove(uuid: string) {
    return await this.prisma.beneficiary.delete({
      where: {
        uuid,
      },
    });
  }
}
