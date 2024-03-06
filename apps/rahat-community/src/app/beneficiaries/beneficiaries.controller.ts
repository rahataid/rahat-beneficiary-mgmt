import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
} from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  BulkInsertDto,
  CreateBeneficiaryDto,
} from './dto/create-beneficiary.dto';
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

@Controller('beneficiaries')
@ApiTags('Beneficiaries')
@ApiBearerAuth('JWT')
export class BeneficiariesController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ROLE })
  @UseGuards(JwtGuard, AbilitiesGuard)
  async create(@Body() dto: CreateBeneficiaryDto) {
    return this.beneficiariesService.create(dto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.USER })
  @UseGuards(JwtGuard, AbilitiesGuard)
  async bulkInsert(@Body() dto: BulkInsertDto) {
    return this.beneficiariesService.addBulk(dto);
  }

  @Post('upload')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.USER })
  @UseGuards(JwtGuard, AbilitiesGuard)
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
  // @UseGuards(JwtGuard, AbilitiesGuard)
  // @ApiFilterQuery('filters', BeneficiaryFilterDto)
  findAll(@Query('') filters: any) {
    return this.beneficiariesService.findAll(filters);
  }

  @Get(':uuid')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findOne(@Param('uuid') uuid: string) {
    return this.beneficiariesService.findOne(uuid);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.MANAGE, subject: SUBJECTS.USER })
  @UseGuards(JwtGuard, AbilitiesGuard)
  update(
    @Param('uuid') uuid: string,
    @Body() updateBeneficiaryDto: UpdateBeneficiaryDto,
  ) {
    return this.beneficiariesService.update(uuid, updateBeneficiaryDto);
  }

  @Delete(':uuid')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.USER })
  @UseGuards(JwtGuard, AbilitiesGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.beneficiariesService.remove(uuid);
  }
}
