import { Injectable, Logger } from '@nestjs/common';
import {
  CreateBeneficiaryGroupDto,
  ListBeneficiaryGroupDto,
  UpdateBeneficiaryGroupDto,
} from '@rahataid/community-tool-extensions';
import { Enums, GroupOrigins } from '@rahataid/community-tool-sdk';
import { RSError } from '@rumsan/core';
import { PrismaService } from '@rumsan/prisma';
import { UUID } from 'crypto';
import { paginate } from '../utils/paginate';
import { InjectQueue } from '@nestjs/bull';
import { JOBS, QUEUE, QUEUE_RETRY_OPTIONS } from '../../constants';
import { Queue } from 'bull';
import XLSX from 'xlsx';
import { deleteFileFromDisk } from '../utils/multer';
import { SourceService } from '../sources/source.service';
import { uuid } from 'uuidv4';
import { BeneficiaryImportService } from '../beneficiary-import/beneficiary-import.service';

const BATCH_SIZE = 50;

@Injectable()
export class BeneficiaryGroupService {
  private readonly logger = new Logger(BeneficiaryGroupService.name);

  constructor(
    @InjectQueue(QUEUE.BENEFICIARY) private benefQueue: Queue,
    private prisma: PrismaService,

  ) {}

  hasOrigins(arr: any) {
    return arr.includes(GroupOrigins.IMPORT && GroupOrigins.TARGETING);
  }

  async create(dto: CreateBeneficiaryGroupDto) {
    this.logger.log(
      `Create beneficiary-group assignment requested. groupUID=${dto.groupUID}, beneficiaries=${dto.beneficiaryUID.length}`,
    );

    const currentGroup = await this.findGroupByUUID(dto.groupUID);

    const totalBeneficiaries = dto.beneficiaryUID.length;

    await this.benefQueue.add(JOBS.CREATE_BENEF_GROUP, {
      ...dto,
    });

    this.logger.debug(
      `Queued beneficiary-group assignment job. groupUID=${dto.groupUID}, job=${JOBS.CREATE_BENEF_GROUP}`,
    );

    return {
      finalMessage: `${totalBeneficiaries} beneficiaries assigned to ${currentGroup.name} group`,
    };
  }

  async createBeneficiaryGroup(dto: CreateBeneficiaryGroupDto) {
    this.logger.log(
      `Processing beneficiary-group assignment. groupUID=${dto.groupUID}, beneficiaries=${dto.beneficiaryUID.length}`,
    );

    const totalBeneficiaries = dto.beneficiaryUID.length;
    for (let i = 0; i < totalBeneficiaries; i += BATCH_SIZE) {
      const currentBatch = dto.beneficiaryUID.slice(i, i + BATCH_SIZE);

      for (const beneficiaryUUID of currentBatch) {
        await this.prisma.beneficiaryGroup.upsert({
          where: {
            benefGroupIdentifier: {
              beneficiaryUID: beneficiaryUUID,
              groupUID: dto.groupUID,
            },
          },
          update: {
            beneficiaryUID: beneficiaryUUID,
            groupUID: dto.groupUID,
          },
          create: {
            beneficiaryUID: beneficiaryUUID,
            groupUID: dto.groupUID,
          },
        });
      }

      this.logger.debug(
        `Beneficiary-group batch completed. groupUID=${
          dto.groupUID
        }, processed=${Math.min(
          i + BATCH_SIZE,
          totalBeneficiaries,
        )}/${totalBeneficiaries}`,
      );
    }
  }

  async findGroupByUUID(uuid: UUID) {
    return this.prisma.group.findUnique({
      where: {
        uuid: uuid,
      },
      select: {
        name: true,
        origins: true,
      },
    });
  }

  async findAll(filters: ListBeneficiaryGroupDto) {
    this.logger.debug(
      `Listing beneficiary-group links. page=${+filters?.page || 1}, perPage=${
        +filters?.perPage || 'default'
      }`,
    );

    return paginate(
      this.prisma.beneficiaryGroup,
      { where: {} },
      {
        page: +filters?.page,
        perPage: +filters?.perPage,
      },
    );
  }

  async findOne(uuid: string) {
    this.logger.debug(`Fetching beneficiary-group link by uuid=${uuid}`);
    return await this.prisma.beneficiaryGroup.findUnique({
      where: {
        uuid,
      },
      select: {
        beneficiary: {
          select: {
            uuid: true,
            firstName: true,
            lastName: true,
            email: true,
            gender: true,
            phone: true,
            notes: true,
            birthDate: true,
          },
        },
        group: {
          select: {
            uuid: true,
            name: true,
          },
        },
      },
    });
  }

  async update(uuid: string, dto: UpdateBeneficiaryGroupDto) {
    return await this.prisma.beneficiaryGroup.update({
      where: { uuid },
      data: {},
    });
  }

  async bulkUpdateFromFile (userUUID:string,groupUUID:string, file:any ){
    console.log(userUUID, 'userId')
     this.logger.debug(`Queueing bulk update from file. path`);
    
      const workbook = XLSX.readFile(file.path);
      await deleteFileFromDisk(file.path);
    
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // Convert sheet to JSON rows
    let rows = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      defval: '',
    });

    // Extract column names (keys) from the first row
    const columnNames = rows.length ? Object.keys(rows[0]) : [];
   

    // Example: extract values of a specific column (e.g., 'uuid')
    // TODO: replace 'uuid' with the desired column name.
    const targetColumn = 'uuid';
    const columnValues = rows.map((row: any) => row[targetColumn]);

    // Extract original file name if available (Multer provides originalname)
    const fileName = (file as any).originalname || file.path.split('/').pop();


    this.logger.debug(`Processing bulk update from file: ${fileName}`);
    this.logger.debug(`Detected columns: ${columnNames.join(', ')}`);
    this.logger.debug(`Extracted ${columnValues.length} values from column '${targetColumn}'.`);  
     const source = await this.prisma.source.create({
      data: {
        name: `Bulk update -${fileName}`,
        importId: `${fileName}`,
        importField: Enums.ImportField.UUID,
        stagedFileKey: "",
        isImported: false,
        importProgress: {

          total:rows.length,
          failed:0, 
          updated:0,
          status:'PENDING',
          startedAt:null,
          completedAt:null,
          error:null
        },
        createdBy: userUUID,
        fieldMapping: {
          columnMap: columnNames.map((col) => ({ sourceField: col, targetField: col })),
        },
      },
    });
 
  // });

   // 3️⃣ Queue the job (pass both source and target group)
  // await this.benefQueue.add(
  //   JOBS.BENEFICIARY.BULK_UPDATE,
  //   { sourceUUID: 'uuid' , groupUUID },
  //   QUEUE_RETRY_OPTIONS,
  // );

  const BATCH_SIZE = 500
  for(let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    await this.benefQueue.add(JOBS.BENEFICIARY.BULK_UPDATE, {
      sourceUUID: source.uuid,
      groupUUID,
      data: chunk,
    }, QUEUE_RETRY_OPTIONS);
  }
  return { success: true, message: 'Bulk update queued', sourceUUID: 'uiuid' };




  }

  async remove(uuid: string) {
    this.logger.log(`Removing beneficiary-group link. uuid=${uuid}`);

    const findBenefGroup = await this.prisma.beneficiaryGroup.findUnique({
      where: {
        uuid,
      },
    });

    if (!findBenefGroup) {
      throw new RSError({
        name: 'Not Found',
        message: 'No Beneficiary Group to Delete',
        type: 'Not Found',
        httpCode: 404,
      });
    }

    return await this.prisma.beneficiaryGroup.delete({
      where: {
        uuid,
      },
    });
  }

  


  async removeBeneficiaryFromGroup(benefUID: string, uuid: string) {
    this.logger.debug(
      `Removing beneficiary from group. beneficiaryUID=${benefUID}, groupUID=${uuid}`,
    );

    return this.prisma.beneficiaryGroup.deleteMany({
      where: {
        groupUID: uuid,
        beneficiaryUID: benefUID,
      },
    });
  }

  async removeBenefFromMultipleGroups(benefUID: string) {
    this.logger.debug(
      `Removing beneficiary from all groups. beneficiaryUID=${benefUID}`,
    );

    return this.prisma.beneficiaryGroup.deleteMany({
      where: {
        beneficiaryUID: benefUID,
      },
    });
  }

  upsertBeneficiaryGroup(beneficiary: string, group: string) {
    this.logger.debug(
      `Upserting beneficiary-group link. beneficiaryUID=${beneficiary}, groupUID=${group}`,
    );

    const payload = {
      beneficiaryUID: beneficiary,
      groupUID: group,
    };
    return this.prisma.beneficiaryGroup.upsert({
      where: {
        benefGroupIdentifier: payload,
      },
      update: payload,
      create: payload,
    });
  }
}
