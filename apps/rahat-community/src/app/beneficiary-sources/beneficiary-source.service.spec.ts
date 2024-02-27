import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiarySourceService } from './beneficiary-source.service';

describe('BeneficiarySourceService', () => {
  let service: BeneficiarySourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeneficiarySourceService],
    }).compile();

    service = module.get<BeneficiarySourceService>(BeneficiarySourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
