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
} from '@rahataid/community-tool-extensions';
import { BeneficiaryStatService } from './beneficiaryStats.service';
import { SUBJECTS } from '@rahataid/community-tool-sdk';

@Controller('beneficiaries')
@ApiTags('Beneficiaries')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class BeneficiariesController {
  constructor(
    private readonly beneficiariesService: BeneficiariesService,

    private readonly benStatsService: BeneficiaryStatService,
  ) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  async getStats() {
    return this.benStatsService.getAllStats();
  }
  @Get('db-fields')
  @HttpCode(HttpStatus.OK)
  beneDBFields() {
    return this.beneficiariesService.fetchDBFields();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  async create(@Body() dto: CreateBeneficiaryDto) {
    return this.beneficiariesService.create(dto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  async bulkInsert(@Body() dto: BulkInsertDto) {
    return this.beneficiariesService.addBulk(dto);
  }

  @Post('upload')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadAsset(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10000000000 })],
      }),
    )
    file: //@ts-ignore
    Express.Multer.file,
  ) {
    return this.beneficiariesService.uploadFile(file);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  findAll(@Query('') filters: ListBeneficiaryDto) {
    return this.beneficiariesService.findAll(filters);
  }

  @Get(':uuid')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  findOne(@Param('uuid') uuid: string) {
    console.log(uuid);
    return this.beneficiariesService.findOne(uuid);
  }

  @Put(':uuid')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.ALL })
  update(
    @Param('uuid') uuid: string,
    @Body() updateBeneficiaryDto: UpdateBeneficiaryDto,
  ) {
    return this.beneficiariesService.update(uuid, updateBeneficiaryDto);
  }

  @Delete(':uuid')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.ALL })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string, @Req() req: any) {
    const userUUID = req?.user?.uuid;
    return this.beneficiariesService.remove(uuid, userUUID);
  }

  @Get(':name')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  findStatsByName(@Param('name') name: string) {
    return this.benStatsService.getStatsByName(name);
  }
}
