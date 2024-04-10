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
} from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

import {
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  ACTIONS,
  SUBJECTS,
} from '@rumsan/user';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { multerOptions } from '../utils/multer';
import {
  BulkInsertDto,
  CreateBeneficiaryDto,
  UpdateBeneficiaryDto,
} from '@community-tool/extentions';
import { BeneficiaryStatService } from './beneficiaryStats.service';

@Controller('beneficiaries')
@ApiTags('Beneficiaries')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class BeneficiariesController {
  constructor(
    private readonly beneficiariesService: BeneficiariesService,

    private readonly statsService: BeneficiaryStatService,
  ) {}

  @Get('db-fields')
  @HttpCode(HttpStatus.OK)
  beneDBFields() {
    return this.beneficiariesService.fetchDBFields();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.PUBLIC })
  async create(@Body() dto: CreateBeneficiaryDto) {
    return this.beneficiariesService.create(dto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.USER })
  async bulkInsert(@Body() dto: BulkInsertDto) {
    return this.beneficiariesService.addBulk(dto);
  }

  @Post('upload')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.USER })
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
  @CheckAbilities({ actions: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  findAll(@Query('') filters: any) {
    return this.beneficiariesService.findAll(filters);
  }

  @Get(':uuid')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  findOne(@Param('uuid') uuid: string) {
    return this.beneficiariesService.findOne(uuid);
  }

  @Get('stats')
  async getStats() {
    return this.statsService.getAllStats();
  }

  @Put(':uuid')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.MANAGE, subject: SUBJECTS.USER })
  update(
    @Param('uuid') uuid: string,
    @Body() updateBeneficiaryDto: UpdateBeneficiaryDto,
  ) {
    console.log(updateBeneficiaryDto);
    return this.beneficiariesService.update(uuid, updateBeneficiaryDto);
  }

  @Delete(':uuid')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.USER })
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.beneficiariesService.remove(uuid);
  }
}
