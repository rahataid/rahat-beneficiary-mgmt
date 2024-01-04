import { Injectable } from '@nestjs/common';
import { CreateBeneficiaryGroupDto } from './dto/create-beneficiary-group.dto';
import { UpdateBeneficiaryGroupDto } from './dto/update-beneficiary-group.dto';

@Injectable()
export class BeneficiaryGroupService {
  create(createBeneficiaryGroupDto: CreateBeneficiaryGroupDto) {
    return 'This action adds a new beneficiaryGroup';
  }

  findAll() {
    return `This action returns all beneficiaryGroup`;
  }

  findOne(id: number) {
    return `This action returns a #${id} beneficiaryGroup`;
  }

  update(id: number, updateBeneficiaryGroupDto: UpdateBeneficiaryGroupDto) {
    return `This action updates a #${id} beneficiaryGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} beneficiaryGroup`;
  }
}
