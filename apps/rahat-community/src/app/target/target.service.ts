import { Injectable } from '@nestjs/common';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { filterExtraFieldValues } from '../beneficiaries/helpers';

@Injectable()
export class TargetService {
  constructor(private benefService: BeneficiariesService) {}
  async create(dto: CreateTargetDto) {
    const { query, extras } = dto;
    // Create a new target
    // Fetch results from the database using the query
    const data = await this.benefService.searchTargets(query);
    if (!extras || Object.keys(extras).length < 1) return data.rows;
    // Further filter the results if extras object has keys
    const filteredData = filterExtraFieldValues(data.rows, extras);
    // Attach Search_UUID to the results
    // Save reults in the database
    // Update target status to completed
    return filteredData;
  }

  findAll() {
    return `This action returns all target`;
  }

  findOne(id: number) {
    return `This action returns a #${id} target`;
  }

  update(id: number, updateTargetDto: UpdateTargetDto) {
    return `This action updates a #${id} target`;
  }

  remove(id: number) {
    return `This action removes a #${id} target`;
  }
}
