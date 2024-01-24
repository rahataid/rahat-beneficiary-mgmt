import { Injectable } from '@nestjs/common';
import { CreateFieldDefinitionDto } from './dto/create-field-definition.dto';
import {
  UpdateFieldDefinitionDto,
  updateStatusDto,
} from './dto/update-field-definition.dto';
import { PrismaService } from '@rahat/prisma';
import { paginate } from '../utils/paginate';

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
      where: { is_active: true },
    });
  }

  findAll(query: any) {
    const select = {
      id: true,
      name: true,
      field_type: true,
      is_active: true,
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

  updateStatus(id: number, dto: updateStatusDto) {
    return this.prisma.fieldDefinition.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} fieldDefinition`;
  }
}
