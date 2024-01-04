import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiaryGroupController } from './beneficiary-group.controller';
import { BeneficiaryGroupService } from './beneficiary-group.service';

describe('BeneficiaryGroupController', () => {
  let controller: BeneficiaryGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeneficiaryGroupController],
      providers: [BeneficiaryGroupService],
    }).compile();

    controller = module.get<BeneficiaryGroupController>(BeneficiaryGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
