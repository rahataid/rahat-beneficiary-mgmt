import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiarySourceController } from './beneficiary-source.controller';
import { BeneficiarySourceService } from './beneficiary-source.service';

describe('BeneficiarySourceController', () => {
  let controller: BeneficiarySourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeneficiarySourceController],
      providers: [BeneficiarySourceService],
    }).compile();

    controller = module.get<BeneficiarySourceController>(BeneficiarySourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
