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
  create(createFieldDefinitionDto: CreateFieldDefinitionDto) {
    console.log(createFieldDefinitionDto);
    try {
      const payload = {
        ...createFieldDefinitionDto,
        name: createFieldDefinitionDto.name.toLocaleLowerCase(),
      };
      console.log('payload', payload);
      return this.prisma.fieldDefinition.create({
        data: payload,
      });
    } catch (err) {
      throw new Error(err);
    }
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

  update(id: number, updateFieldDefinitionDto: UpdateFieldDefinitionDto) {
    try {
      const payload = {
        ...updateFieldDefinitionDto,
        name: updateFieldDefinitionDto.name.toLocaleLowerCase(),
      };
      return this.prisma.fieldDefinition.update({
        where: { id },
        data: payload,
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  updateStatus(id: number, dto: updateStatusDto) {
    try {
      return this.prisma.fieldDefinition.update({
        where: { id },
        data: dto,
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} fieldDefinition`;
  }
}
