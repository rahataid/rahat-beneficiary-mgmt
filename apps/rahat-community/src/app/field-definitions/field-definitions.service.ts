import { Injectable } from '@nestjs/common';

import { PrismaService } from '@rumsan/prisma';
import { paginate } from '../utils/paginate';
import {
  CreateFieldDefinitionDto,
  UpdateFieldDefinitionDto,
  updateFieldStatusDto,
} from '@community-tool/extentions';

@Injectable()
export class FieldDefinitionsService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateFieldDefinitionDto) {
    const payload = {
      ...dto,
      name: dto.name.toLocaleLowerCase(),
    };

    return this.prisma.fieldDefinition.create({
      data: payload,
    });
  }

  listActive() {
    return this.prisma.fieldDefinition.findMany({
      where: { isActive: true },
    });
  }

  findAll(query: any) {
    const select = {
      id: true,
      name: true,
      fieldType: true,
      isActive: true,
    };

    return paginate(
      this.prisma.fieldDefinition,
      { select },
      {
        page: query?.page,
        perPage: query?.perPage,
      },
    );
  }

  async findOne(id: number) {
    const data = await this.prisma.fieldDefinition.findUnique({
      where: { id },
    });
    if (!data) return { status: 404, message: 'Data not found!' };
    return data;
  }

  update(id: number, dto: UpdateFieldDefinitionDto) {
    const payload = {
      ...dto,
      name: dto.name.toLocaleLowerCase(),
    };
    return this.prisma.fieldDefinition.update({
      where: { id },
      data: payload,
    });
  }

  updateStatus(id: number, dto: updateFieldStatusDto) {
    return this.prisma.fieldDefinition.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} fieldDefinition`;
  }
}
