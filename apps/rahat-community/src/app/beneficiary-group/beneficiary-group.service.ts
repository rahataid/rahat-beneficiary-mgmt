import { Injectable } from '@nestjs/common';
import { CreateBeneficiaryGroupDto } from './dto/create-beneficiary-group.dto';
import { UpdateBeneficiaryGroupDto } from './dto/update-beneficiary-group.dto';
import { PrismaService } from '@rahat/prisma';

@Injectable()
export class BeneficiaryGroupService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateBeneficiaryGroupDto) {
    await this.prisma.$transaction(async (prisma) => {
      const data = await prisma.beneficiaryGroup.findFirst({
        where: {
          beneficary_id: dto.beneficiary_id,
          group_id: dto.group_id,
        },
      });

      if (data) throw new Error('Already Connected');

      await prisma.beneficiaryGroup.create({
        data: {
          beneficiary: {
            connect: {
              id: dto.beneficiary_id,
            },
          },
          group: {
            connect: {
              id: dto.group_id,
            },
          },
        },
      });
    });
    return 'Created Succesfully';
  }

  async findAll() {
    await this.prisma.beneficiaryGroup.findMany({});
  }

  async findOne(id: number) {
    await this.prisma.beneficiaryGroup.findUnique({
      where: {
        id,
      },
      select: {
        beneficiary: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            gender: true,
            phone: true,
            notes: true,
            birth_date: true,
          },
        },
        group: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async update(id: number, dto: UpdateBeneficiaryGroupDto) {
    await this.prisma.beneficiaryGroup.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} beneficiaryGroup`;
  }
}
