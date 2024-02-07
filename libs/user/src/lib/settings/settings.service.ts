import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateSettingsDto, EditSettingsDto } from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from '../constants';

import { PrismaService } from '@rahat/prisma';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  stringToArray(value: string) {
    let arr: string[] = [];
    if (typeof value === 'string') arr = value.split('.');
    return arr.map((v) => v.trim());
  }

  isJsonObject(str: any, isAlreadyString = false) {
    try {
      if (Array.isArray(str)) return false;
      const json = isAlreadyString
        ? JSON.parse(str)
        : JSON.parse(JSON.stringify(str));
      return typeof json === 'object';
    } catch (error) {
      return false;
    }
  }

  convertObjectKeysToUpperCase(source: any): Record<string, any> {
    return Object.keys(source).reduce(
      (destination: Record<string, any>, key: string) => {
        destination[key.toUpperCase()] = source[key];
        return destination;
      },
      {},
    );
  }

  hasAllFields = (requiredFields: string, suppliedFields: string): boolean => {
    const reqFields = this.stringToArray(requiredFields);
    const suppFields = this.stringToArray(suppliedFields);

    const akl = reqFields.every((element: string) => {
      return suppFields.indexOf(element) !== -1;
    });
    return akl;
  };

  async create(dto: CreateSettingsDto) {
    dto.name = dto.name.toUpperCase();

    const isExist = await this.prisma.settings.findUnique({
      where: {
        name: dto.name,
      },
    });
    if (isExist) throw new Error('Settings already Exist');
    // Check and convert reqFields to Array
    const reqFields = dto.requiredFields
      ? this.stringToArray(dto.requiredFields)
      : null;
    if (reqFields?.length) {
      // Check if dto.value is JSON
      if (!this.isJsonObject(dto.value))
        throw new Error(
          'Must send JSON object when requiredField is specified.',
        );
      // Convert fields to Uppercase
      dto.requiredFields = reqFields.map((f) => {
        return f.toUpperCase();
      });
      // Update dto.value keys to Uppercase
      dto.value = this.convertObjectKeysToUpperCase(dto.value);
      // Check requiredFields exist in suppliedFields
      const suppliedFields = Object.keys(dto.value).toString();
      const hasAll = this.hasAllFields(
        dto.requiredFields.toString(),
        suppliedFields,
      );
      if (!hasAll)
        throw new Error(
          `Must send all required fields [${dto.requiredFields.join(',')}]`,
        );
    }
    dto.value = { data: dto.value };
    return this.prisma.settings.create({ data: dto });
  }

  async updateByName(dto: EditSettingsDto) {
    if (!dto.name) throw new Error('Setting name is Required');
    dto.name = dto.name.toUpperCase();
    // Fetch existing setting
    const setting = await this.prisma.settings.findUnique({
      where: { name: dto.name },
    });
    if (!setting) throw new Error('Settings not Found');
    if (setting.isReadOnly) throw new Error('Setting is read-only');

    // check if requiredFeild  exist
    if (setting?.requiredFields.length) {
      dto.value = this.convertObjectKeysToUpperCase(dto.value);
      const suppliedFields = Object.keys(dto.value).toString();
      // Check if supplied fields exist inside requiredFields
      const hasAll = this.hasAllFields(
        setting.requiredFields.toString(),
        suppliedFields,
      );
      if (!hasAll)
        throw new Error(
          `Must send all required fields [${setting.requiredFields.join(',')}]`,
        );
      dto.requiredFields = suppliedFields.split(',');
      // Filter only requiredFields matching supplied fields
      const json_value: Record<string, any> = Object.keys(dto.value)
        .filter((key: string) => setting.requiredFields.includes(key))
        .reduce((obj: Record<string, any>, key: string) => {
          obj[key] = (dto.value as Record<string, any>)[key];
          return obj;
        }, {});
      dto.value = { data: json_value };
    } else {
      dto.requiredFields = [];
    }
    const updated = await this.prisma.settings.update({
      where: { id: +setting.id },
      data: { ...dto },
    });
    const updatedList = await this.listPublic();
    this.eventEmitter.emit(EVENTS.REFRESH_APP_SETTINGS, updatedList);
    return updated;
  }

  async getById(id: number) {
    const getById = await this.prisma.settings.findUnique({
      where: { id: +id },
    });
    if (!getById) throw new Error('Not Found');

    return getById;
  }

  async getPublic(id: number) {
    const getPublic = await this.prisma.settings.findUnique({
      where: { id: +id, isPrivate: false },
    });

    if (!getPublic) throw new Error('Not Found');
    return getPublic;
  }

  async getByName(name: string) {
    name = name.toUpperCase();
    const getByName = await this.prisma.settings.findMany({
      where: { name, isPrivate: false },
    });

    if (!getByName) throw new Error('Not Found');
    return getByName;
  }

  listPublic() {
    return this.prisma.settings.findMany({ where: { isPrivate: false } });
  }

  async delete(id: number) {
    const row = await this.getById(id);
    if (!row) throw new Error('Settings does not exist!');
    return this.prisma.settings.delete({ where: { id: +id } });
  }
}
