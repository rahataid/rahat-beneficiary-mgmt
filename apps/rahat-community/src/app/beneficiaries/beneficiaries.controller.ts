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
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { AbilitiesGuard, CheckAbilities, JwtGuard } from '@rahat/user';
import { ACTIONS, SUBJECTS } from '@rahat/user';
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
  @CheckAbilities({ action: ACTIONS.CREATE, subject: SUBJECTS.ROLE })
  @UseGuards(JwtGuard, AbilitiesGuard)
  create(@Body() createBeneficiaryDto: CreateBeneficiaryDto) {
    return this.beneficiariesService.create(createBeneficiaryDto);
  }

  @Post('upload')
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
  // @ApiFilterQuery('filters', BeneficiaryFilterDto)
  findAll(@Query('') filters: any) {
    return this.beneficiariesService.findAll(filters);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.beneficiariesService.findOne(uuid);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid') uuid: string,
    @Body() updateBeneficiaryDto: UpdateBeneficiaryDto,
  ) {
    return this.beneficiariesService.update(uuid, updateBeneficiaryDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.beneficiariesService.remove(uuid);
  }
}
