import { Injectable } from '@nestjs/common';
import { CreateBeneficiarySourceDto } from './dto/create-beneficiary-source.dto';
import { UpdateBeneficiarySourceDto } from './dto/update-beneficiary-source.dto';

@Injectable()
export class BeneficiarySourceService {
  create(dto: CreateBeneficiarySourceDto) {
    try {
      return 'This action adds a new beneficiarySource';
    } catch (err) {}
  }

  findAll() {
    return `This action returns all beneficiarySource`;
  }

  findOne(id: number) {
    return `This action returns a #${id} beneficiarySource`;
  }

  update(id: number, dto: UpdateBeneficiarySourceDto) {
    try {
      return 'This action adds a new beneficiarySource';
    } catch (err) {}
  }

  remove(id: number) {
    try {
      return 'This action adds a new beneficiarySource';
    } catch (err) {}
  }
}
