import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CreateTagsDto } from './dto/create-tags.dto';
import { CreateManager } from './dto/manager.dto';

@Controller('communities')
@ApiTags('communities')
export class CommunityController {
  constructor(private readonly communitiesService: CommunityService) {}

  @Post()
  create(@Body() createCommunityDto: CreateCommunityDto) {
    return this.communitiesService.create(createCommunityDto);
  }

  @Get()
  findAll(@Query() query?: any) {
    return this.communitiesService.findAll(query);
  }

  @Get('geoLocation')
  getGeoLocation() {
    return this.communitiesService.getTheCommunityGeoLocation();
  }

  @Get(':address')
  findOne(@Param('address') address: string) {
    return this.communitiesService.findOne(address);
  }

  @Patch(':address/edit')
  update(@Param('address') address: string, @Body() data: any) {
    return this.communitiesService.update(address, data);
  }

  @Delete(':address/delete')
  remove(@Param('address') address: string) {
    return this.communitiesService.remove(address);
  }

  @Post('tags/bulk')
  createTagsBulk(@Body() tags: CreateTagsDto) {
    return this.communitiesService.createBulkTags(tags.tags);
  }

  @Get('tags')
  getAllTags() {
    return this.communitiesService.getAllTags();
  }

  @Post('/manager')
  createCommunityManager(@Body() manager: CreateManager) {
    return this.communitiesService.createCommunityManager(manager);
  }

  @Get('/search/:searchKey')
  searchCommunity(@Param('searchKey') searchKey: string) {
    return this.communitiesService.search(searchKey);
  }

  @Post(':walletAddress/upload-asset/:key')
  @UseInterceptors(FileInterceptor('file'))
  uploadAsset(
    @Param('walletAddress') walletAddress: string,
    @Param('key') key: string,
    @UploadedFile() file,
  ) {
    return this.communitiesService.uploadAsset(walletAddress, key, file);
  }

  @Post(':walletAddress/upload-asset/:key/multiple')
  @UseInterceptors(AnyFilesInterceptor())
  uploadMultipleAsset(
    @Param('walletAddress') walletAddress: string,
    @Param('key') key: string,
    @UploadedFiles() files,
  ) {
    return this.communitiesService.uploadMultipleAsset(
      walletAddress,
      key,
      files,
    );
  }

  @Patch(':walletAddress/images/gallery')
  updateImages(
    @Param('walletAddress') walletAddress: string,
    @Body() body: any,
  ) {
    return this.communitiesService.removeImageAssets(
      walletAddress,
      body?.fileName,
    );
  }
}
