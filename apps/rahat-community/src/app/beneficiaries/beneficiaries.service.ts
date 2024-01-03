import { Injectable } from '@nestjs/common';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { PrismaService } from '@rahat/prisma';

@Injectable()
export class BeneficiariesService {
  constructor(private prisma: PrismaService) {}
  async create(createBeneficiaryDto: CreateBeneficiaryDto) {
    await this.prisma.beneficiary.create({
      data: {
        firstName: createBeneficiaryDto.firstName,
        lastName: createBeneficiaryDto.lastName,
        gender: createBeneficiaryDto.gender,
        birthDate: createBeneficiaryDto.birthDate,
        email: createBeneficiaryDto.email,
        extras: createBeneficiaryDto.extras,
        location: createBeneficiaryDto.location,
        latitude: createBeneficiaryDto.latitude,
        longitude: createBeneficiaryDto.longitude,
        phone: createBeneficiaryDto.phone,
        notes: createBeneficiaryDto.notes,
      },
    });

    return 'created Successfully';
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
