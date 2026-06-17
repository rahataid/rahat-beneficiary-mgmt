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
  Req,
  Put,
} from '@nestjs/common';
import { BeneficiaryGroupService } from './beneficiary-group.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
} from '@rumsan/user';
import {
  CreateBeneficiaryGroupDto,
  ListBeneficiaryGroupDto,
  UpdateBeneficiaryGroupDto,
} from '@rahataid/community-tool-extensions';
import { SUBJECTS } from '@rahataid/community-tool-sdk';
import { multerOptions } from '../utils/multer';
import { FileInterceptor } from '@nestjs/platform-express';
const MAX_FILE_SIZE = 10000000000;

@Controller('beneficiary-group')
@ApiTags('BeneficiaryGroup')
@ApiBearerAuth('JWT')
export class BeneficiaryGroupController {
  constructor(
    private readonly beneficiaryGroupService: BeneficiaryGroupService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({
    actions: ACTIONS.CREATE,
    subject: SUBJECTS.GROUP,
  })
  // @UseGuards(JwtGuard, AbilitiesGuard)
  create(@Body() dto: CreateBeneficiaryGroupDto) {
    return this.beneficiaryGroupService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({
    actions: ACTIONS.READ,
    subject: SUBJECTS.GROUP,
  })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findAll(@Query() filters: ListBeneficiaryGroupDto) {
    return this.beneficiaryGroupService.findAll(filters);
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({
    actions: ACTIONS.READ,
    subject: SUBJECTS.GROUP,
  })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findOne(@Param('uuid') uuid: string) {
    return this.beneficiaryGroupService.findOne(uuid);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({
    actions: ACTIONS.UPDATE,
    subject: SUBJECTS.GROUP,
  })
  @UseGuards(JwtGuard, AbilitiesGuard)
  update(
    @Param('uuid') uuid: string,
    @Body() updateBeneficiaryGroupDto: UpdateBeneficiaryGroupDto,
  ) {
    return this.beneficiaryGroupService.update(uuid, updateBeneficiaryGroupDto);
  }


  @Put(':groupUUID/bulk-update')
    @HttpCode(HttpStatus.OK)
    @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.GROUP })
    @UseGuards(JwtGuard, AbilitiesGuard)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async  bulkUpate(
      @Req() req: any,
       @Param('groupUUID') groupUUID: string,
      @UploadedFile(
        new ParseFilePipe({
          validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
        }),
      )
      file: //@ts-ignore
      Express.Multer.file,
    ) {
 
      return this.beneficiaryGroupService.bulkUpdateFromFile(req?.user?.uuid,groupUUID,file);
    }

  @Delete(':uuid')
  @CheckAbilities({
    actions: ACTIONS.DELETE,
    subject: SUBJECTS.GROUP,
  })
  @UseGuards(JwtGuard, AbilitiesGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.beneficiaryGroupService.remove(uuid);
  }
}
