import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Put,
  Req,
} from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

import {
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  ACTIONS,
  // SUBJECTS,
} from '@rumsan/user';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { multerOptions } from '../utils/multer';
import {
  BulkInsertDto,
  CreateBeneficiaryDto,
  ListBeneficiaryDto,
  UpdateBeneficiaryDto,
  VerificationSignatureDTO,
} from '@rahataid/community-tool-extensions';
import { BeneficiaryStatService } from './beneficiaryStats.service';
import { SUBJECTS } from '@rahataid/community-tool-sdk';
import { VerificationService } from './verification.service';

const MAX_FILE_SIZE = 10000000000;

@Controller('beneficiaries')
@ApiTags('Beneficiaries')
@ApiBearerAuth('JWT')
export class BeneficiariesController {
  constructor(
    private readonly beneficiariesService: BeneficiariesService,

    private readonly benStatsService: BeneficiaryStatService,

    private readonly verificationService: VerificationService,
  ) {}
  @UseGuards(JwtGuard, AbilitiesGuard)
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  async getStats() {
    return this.benStatsService.getAllStats();
  }

  @UseGuards(JwtGuard, AbilitiesGuard)
  @Get('db-fields')
  @HttpCode(HttpStatus.OK)
  beneDBFields() {
    return this.beneficiariesService.fetchDBFields();
  }

  @UseGuards(JwtGuard, AbilitiesGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.BENEFICIARY })
  async create(@Body() dto: CreateBeneficiaryDto, @Req() req: any) {
    dto.createdBy = req?.user?.uuid || '';
    return this.beneficiariesService.create(dto);
  }

  @UseGuards(JwtGuard, AbilitiesGuard)
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.BENEFICIARY })
  async bulkInsert(@Body() dto: BulkInsertDto) {
    return this.beneficiariesService.addBulk(dto);
  }

  @UseGuards(JwtGuard, AbilitiesGuard)
  @Post('upload')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.BENEFICIARY })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadAsset(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
      }),
    )
    file: //@ts-ignore
    Express.Multer.file,
  ) {
    return this.beneficiariesService.uploadFile(file);
  }

  @UseGuards(JwtGuard, AbilitiesGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.BENEFICIARY })
  findAll(@Query('') filters: ListBeneficiaryDto) {
    return this.beneficiariesService.findAll(filters);
  }

  @UseGuards(JwtGuard, AbilitiesGuard)
  @Get('location')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.BENEFICIARY })
  findAllLocation() {
    return this.beneficiariesService.findAllLocation();
  }
  @UseGuards(JwtGuard, AbilitiesGuard)
  @Get(':uuid')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.BENEFICIARY })
  findOne(@Param('uuid') uuid: string) {
    return this.beneficiariesService.findOne(uuid);
  }

  @UseGuards(JwtGuard, AbilitiesGuard)
  @Put(':uuid')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.BENEFICIARY })
  update(@Param('uuid') uuid: string, @Body() dto: UpdateBeneficiaryDto) {
    return this.beneficiariesService.update(uuid, dto);
  }

  @UseGuards(JwtGuard, AbilitiesGuard)
  @Delete(':uuid')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.BENEFICIARY })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string, @Req() req: any) {
    const userUUID = req?.user?.uuid;
    return this.beneficiariesService.remove(uuid, userUUID);
  }

  @UseGuards(JwtGuard, AbilitiesGuard)
  @Get(':name')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.BENEFICIARY })
  findStatsByName(@Param('name') name: string) {
    return this.benStatsService.getStatsByName(name);
  }

  @UseGuards(JwtGuard, AbilitiesGuard)
  @Post('send-verification/:uuid')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.BENEFICIARY })
  generateLink(@Param('uuid') uuid: string) {
    return this.verificationService.generateLink(uuid);
  }

  @Post('verify-signature')
  verifySignature(@Body() dto: VerificationSignatureDTO) {
    return this.verificationService.verifySignature(dto);
  }
}
