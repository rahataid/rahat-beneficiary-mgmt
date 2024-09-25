import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  FileUploadDto,
  FilterBeneficiaryByLocationDto,
} from '@rahataid/community-tool-extensions';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  SUBJECTS,
} from '@rumsan/user';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('app')
@ApiTags('APP')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  @Get('stats')
  getStats(@Query('') query: FilterBeneficiaryByLocationDto) {
    return this.appService.getStats(query);
  }

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  @Get('kobo-import/:name')
  getDataFromKoboTool(@Param('name') name: string) {
    return this.appService.getDataFromKoboTool(name);
  }

  @Get('settings/kobotool')
  @ApiBearerAuth('JWT')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  filterSettingByType() {
    return this.appService.findKobotoolSettings();
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file',
    type: FileUploadDto,
  })
  @Post('file')
  @ApiBearerAuth('JWT')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.PUBLIC })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const buffer = file.buffer;
    const mimeType = file.mimetype;
    const fileName = file.originalname.replace(/\s/g, '-');

    const folderName = process.env.AWS_FOLDER_NAME;
    const rootFolderName = process.env.AWS_ROOT_FOLDER_NAME;

    return await this.appService.uploadFile(
      buffer,
      mimeType,
      fileName,
      folderName,
      rootFolderName,
    );
  }
}
