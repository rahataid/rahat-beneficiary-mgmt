import { Injectable } from '@nestjs/common';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';

@Injectable()
export class TargetService {
  constructor(private benefService: BeneficiariesService) {}
  async create(dto: CreateTargetDto) {
    console.log('DTO=>', dto);
    // Create a new target
    // Fetch results from the database using the query
    const data = await this.benefService.searchTargets(dto.query);
    console.log('DATA=>', data);
    // Further filter the results using the extras
    // Save reults in the database
    return data;
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
