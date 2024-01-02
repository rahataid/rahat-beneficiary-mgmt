import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AssetUploader } from 'rs-asset-uploader';
import {
  AssetAvailableUploaders,
  UploadAssetParams,
} from 'rs-asset-uploader/dist/types';
import { paginate } from '../utils/paginate';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CreateManager } from './dto/manager.dto';
import {
  UpdateCommunityAssetDto,
  UpdateCommunityDto,
} from './dto/update-community.dto';
import { PrismaService } from '@rahat/prisma';

export const awsConfig = {
  accessKey: process.env.AWS_ACCESS_KEY_ID,
  // secret: 'ceYDNMdF0uOGfy/ZxySaO3nfYi3Vcf20JXq+D1F3',
  secret: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_BUCKET_NAME,
};

AssetUploader.set(AssetAvailableUploaders.S3, awsConfig);

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCommunityDto: CreateCommunityDto) {
    const { address, name, categoryId, country, localCurrency, description } =
      createCommunityDto;
    return this.prisma.community.create({
      data: {
        localCurrency,
        name,
        address,
        description,
        country,
        category: {
          connect: {
            id: categoryId,
          },
        },
        summary: {
          create: {
            total_beneficiaries: 0,
          },
        },
      },
    });
  }

  findAll(query: any) {
    const where: Prisma.CommunityWhereInput = {};

    if (query.category) {
      where.categoryId = Number(query.category);
    }

    if (query.country) {
      where.country = query.country;
    }

    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      };
    }

    const select: Prisma.CommunitySelect = {
      category: true,
      country: true,
      name: true,
      id: true,
      fundRaisedUsd: true,
      fundRaisedLocal: true,
      localCurrency: true,
      latitude: true,
      longitude: true,
      description: true,
      address: true,
      images: true,
      district: true,
      managers: true,
      summary: true,
      createdAt: true,
    };
    const orderBy: Prisma.CommunityOrderByWithRelationInput = {
      name: 'asc',
    };

    return paginate(
      this.prisma.community,
      { where, select, orderBy },
      {
        page: query.page,
        perPage: query.perPage,
      },
    );
  }

  async getTheCommunityGeoLocation() {
    return await this.prisma.community.findMany({
      select: {
        latitude: true,
        longitude: true,
        country: true,
      },
    });
  }

  findOne(address: string) {
    if (!address) {
      throw new Error('Address not provided');
    }
    return this.prisma.community.findUnique({
      where: {
        address,
      },
      include: {
        summary: true,
        category: true,
        _count: true,
      },
    });
  }

  async update(address: string, updateCommunityDto: UpdateCommunityDto) {
    const findCommunity = await this.prisma.communityDemographics.findFirst({
      where: {
        community: {
          address: address,
        },
      },
    });

    if (findCommunity === null) {
      await this.prisma.communityDemographics.create({
        data: {
          total_beneficiaries: updateCommunityDto.beneficiaries,
          community: {
            connect: {
              address: address,
            },
          },
        },
      });
    } else {
      const jkl = await this.prisma.community.update({
        where: { address },
        data: {
          name: updateCommunityDto.name,
          address: updateCommunityDto.address,
          categoryId: updateCommunityDto.categoryId,
          latitude: updateCommunityDto.latitude,
          longitude: updateCommunityDto.longitude,
          fundRaisedUsd: updateCommunityDto.fundRaisedUsd,
          fundRaisedLocal: updateCommunityDto.fundRaisedLocal,
          description: updateCommunityDto.description,
          country: updateCommunityDto.country,
          district: updateCommunityDto.district,
          managers: updateCommunityDto.managers,
          summary: {
            update: {
              where: {
                id: findCommunity.id,
              },
              data: {
                total_beneficiaries: updateCommunityDto.beneficiaries,
              },
            },
          },
        },
      });

      return jkl;
    }
  }

  async remove(address: string) {
    await this.prisma.community.delete({
      where: {
        address: address,
      },
    });
    return `Deleted  succesfully`;
  }

  // async updateAsset(address: string, assetData: UpdateCommunityAssetDto) {
  //   const updateData: UpdateCommunityAssetDto = {};

  //   const community = await this.prisma.community.findUnique({
  //     where: {
  //       address,
  //     },
  //   });

  //   if (!community) {
  //     throw new Error('Community not found');
  //   }

  //   const commImage = community.images as Prisma.JsonObject;

  //   if (assetData.logo) {
  //     updateData.logo = assetData.logo;
  //   }

  //   if (assetData.cover) {
  //     updateData.cover = assetData.cover;
  //   }

  //   if (assetData.gallery) {
  //     updateData.gallery = assetData.gallery;
  //   }

  //   return this.prisma.community.update({
  //     where: { address },
  //     data: {

  //     },
  //   });
  // }

  async search(searchKey: string) {
    return this.prisma.community.findMany({
      where: {
        name: {
          contains: searchKey,
          mode: 'insensitive',
        },
      },
    });
  }

  async createBulkTags(tags: string[]) {
    const tagsData: Prisma.TagsCreateManyInput[] = tags.map((tag) => {
      return { name: tag };
    });

    await this.prisma.category.createMany({
      data: tagsData,
      skipDuplicates: true,
    });

    return this.prisma.tags.createMany({
      data: tagsData,
      skipDuplicates: true,
    });
  }

  async getAllTags() {
    const tags = await this.prisma.tags.findMany({});
    return tags.map((tag) => ({
      ...tag,
      id: Number(tag.id), // Convert id to number
    }));
  }

  async createCommunityManager(manager: CreateManager) {
    return this.prisma.communityManager.create({
      data: {
        name: manager.name,
        email: manager.email,
        phone: manager.phone.toString(),
        walletAddress: manager.walletAddress,
      },
    });
  }

  async uploadAsset(walletAddress: string, key: string, assetData: any) {
    const community = await this.prisma.community.findUnique({
      where: {
        address: walletAddress,
      },
    });
    const uploadData: UploadAssetParams = {
      file: assetData.buffer,
      fileName: assetData.originalname,
      mimeType: assetData.mimetype,
      rootFolderName: process.env.AWS_ROOT_FOLDER,
      folderName: community.name,
    };
    const uploaded = await AssetUploader.upload(uploadData);

    if (uploaded) {
      //@ts-ignore
      const updateData: UpdateCommunityAssetDto = {};
      console.log(updateData);

      if (!community) {
        throw new Error('Community not found');
      }

      const commImage = community.images as Prisma.JsonObject;

      // @ts-ignore
      updateData[key] = uploaded?.fileNameHash;
      console.log(updateData);

      const kk = await this.prisma.community.update({
        where: { address: walletAddress },
        data: {
          images: {
            ...commImage,
            ...updateData,
          },
        },
      });

      return kk;
    }

    // return uploaded;
  }

  async uploadMultipleAsset(
    walletAddress: string,
    key: string,
    assetData: any,
  ) {
    const community = await this.prisma.community.findUnique({
      where: {
        address: walletAddress,
      },
    });

    //  @ts-ignore
    const uploadedHash = community?.images?.gallery
      ? //@ts-expect-error
        [...community?.images?.gallery]
      : [];
    for (const asset of assetData) {
      const uploadData: UploadAssetParams = {
        file: asset.buffer,
        fileName: asset.originalname,
        mimeType: asset.mimetype,
        folderName: community.name,
        rootFolderName: process.env.AWS_ROOT_FOLDER,
      };
      const uploaded = await AssetUploader.upload(uploadData);
      if (uploaded) {
        //@ts-ignore
        uploadedHash.push(uploaded?.fileNameHash);
      }
    }
    if (!community) {
      throw new Error('Community not found');
    }

    //@ts-ignore
    const commImage = community.images as Prisma.JsonObject;

    const updateData = this.prisma.community.updateMany({
      where: {
        address: walletAddress,
      },
      data: {
        images: {
          ...commImage,
          gallery: uploadedHash,
        },
      },
    });
    console.log(updateData);
    return updateData;
  }

  async removeImageAssets(address: string, fileName: string) {
    const community = await this.prisma.community.findUnique({
      where: {
        address: address,
      },
      select: {
        images: true,
      },
    });

    //@ts-ignore
    const remainingImages = community?.images?.gallery.filter(
      (i) => i !== fileName,
    );

    const commImage = community.images as Prisma.JsonObject;

    const updateData = this.prisma.community.updateMany({
      where: {
        address: address,
      },
      data: {
        images: {
          ...commImage,
          gallery: remainingImages,
        },
      },
    });

    return updateData;
  }
}
