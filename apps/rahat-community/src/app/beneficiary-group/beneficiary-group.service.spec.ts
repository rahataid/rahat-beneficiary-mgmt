import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiaryGroupService } from './beneficiary-group.service';

describe('BeneficiaryGroupService', () => {
  let service: BeneficiaryGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeneficiaryGroupService],
    }).compile();

    service = module.get<BeneficiaryGroupService>(BeneficiaryGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
