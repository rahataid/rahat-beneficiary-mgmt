import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  CreateGroupDto,
  ListGroupDto,
  PurgeGroupDto,
  RemoveGroupDto,
  UpdateGroupDto,
} from '@rahataid/community-tool-extensions';
import { SUBJECTS } from '@rahataid/community-tool-sdk';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
} from '@rumsan/user';
import { GroupService } from './group.service';
import { UUID } from 'crypto';
import { multerOptions } from '../utils/multer';
import { DownloadGroupDto } from './dto/download-group.dto';

const MAX_FILE_SIZE = 10_000_000_000;

@Controller('group')
@ApiTags('Group')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.GROUP })
  create(@Body() dto: CreateGroupDto, @Req() req: any) {
    dto.createdBy = req?.user?.uuid || '';
    return this.groupService.create(dto);
  }

  @Post('download')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.GROUP })
  async downloadData(@Body('uuid') uuid: string) {
    return this.groupService.downloadData(uuid);
  }

  @Get(':uuid/download-excel')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.GROUP })
  async downloadExcel(
    @Param('uuid') uuid: string,
    @Query() query: DownloadGroupDto,
    @Res() res: Response,
  ) {
    const buffer = await this.groupService.downloadGroupExcel(
      uuid,
      query.fields,
    );
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${uuid}-beneficiaries.xlsx"`,
    });
    res.send(buffer);
  }

  @Put(':uuid/bulk-update')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.GROUP })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async bulkUpdate(
    @Req() req: any,
    @Param('uuid') uuid: string,
    @Query('batchSize') batchSize: number = 500,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.groupService.bulkUpdateFromFile(
      req?.user?.uuid,
      uuid,
      file,
      +batchSize,
    );
  }

  @Get()
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.GROUP })
  findAll(@Query() query: ListGroupDto) {
    return this.groupService.findAll(query);
  }

  @Get(':uuid')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.GROUP })
  findOne(@Param('uuid') uuid: string, @Query() query: ListGroupDto) {
    return this.groupService.findOne(uuid, query);
  }

  @Get('bulk/:groupUID')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.GROUP })
  bulkGenerateLink(@Param('groupUID') groupUID: string) {
    return this.groupService.bulkGenerateLink(groupUID);
  }

  @Put(':uuid')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.GROUP })
  update(@Param('uuid') uuid: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(uuid, updateGroupDto);
  }

  @Delete('purge')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.GROUP })
  purgeGroup(@Body() dto: PurgeGroupDto) {
    return this.groupService.purgeGroup(dto.groupUuid, dto.beneficiaryUuid);
  }

  @Delete('remove')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.GROUP })
  remove(@Body() dto: RemoveGroupDto) {
    return this.groupService.remove(
      dto.uuid,
      dto.deleteBeneficiaryFlag,
      dto.beneficiaryUuid,
    );
  }

  @Delete(':uuid')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.GROUP })
  deleteGroup(@Param('uuid') uuid: string) {
    return this.groupService.deleteGroup(uuid);
  }

  @Post(':uuid/broadcast')
  @ApiParam({ name: 'uuid', required: true })
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.GROUP })
  broadcastMsg(@Param('uuid') uuid: UUID) {
    return this.groupService.broadcastMessages(uuid);
  }
}
