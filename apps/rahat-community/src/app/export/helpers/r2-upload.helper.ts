import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SETTINGS_NAMES } from '@rahataid/community-tool-sdk';
import { PrismaService } from '@rumsan/prisma';
import { Readable } from 'stream';

export type R2UploadResult = {
  key: string;
  url: string;
};

type R2Settings = {
  ACCOUNT_ID: string;
  ACCESS_KEY_ID: string;
  SECRET_ACCESS_KEY: string;
  BUCKET_NAME: string;
};

async function getR2Settings(prisma: PrismaService): Promise<R2Settings> {
  const setting = await prisma.setting.findUnique({
    where: { name: SETTINGS_NAMES.CLOUDFLARE_R2 },
  });
  if (!setting)
    throw new Error(
      'Cloudflare R2 settings not found. Please seed R2 settings first.',
    );
  return setting.value as R2Settings;
}

function buildR2Client(r2Settings: R2Settings): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${r2Settings.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2Settings.ACCESS_KEY_ID,
      secretAccessKey: r2Settings.SECRET_ACCESS_KEY,
    },
  });
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export const uploadToR2 = async (
  prisma: PrismaService,
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<R2UploadResult> => {
  const r2Settings = await getR2Settings(prisma);
  const r2Client = buildR2Client(r2Settings);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: r2Settings.BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const url = await getSignedUrl(
    r2Client as any,
    new GetObjectCommand({ Bucket: r2Settings.BUCKET_NAME, Key: key }),
    { expiresIn: 3600 },
  );

  return { key, url };
};

export const downloadFromR2 = async (
  prisma: PrismaService,
  key: string,
): Promise<Buffer> => {
  const r2Settings = await getR2Settings(prisma);
  const r2Client = buildR2Client(r2Settings);

  const response = await r2Client.send(
    new GetObjectCommand({
      Bucket: r2Settings.BUCKET_NAME,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`R2 object not found or empty: ${key}`);
  }

  return streamToBuffer(response.Body as Readable);
};

export const deleteFromR2 = async (
  prisma: PrismaService,
  key: string,
): Promise<void> => {
  const r2Settings = await getR2Settings(prisma);
  const r2Client = buildR2Client(r2Settings);

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: r2Settings.BUCKET_NAME,
      Key: key,
    }),
  );
};

/**
 * Moves an R2 object to the `archive/` prefix.
 * R2 has no native rename — this copies to `archive/<key>` then deletes the original.
 * Returns the new archive key.
 */
export const archiveInR2 = async (
  prisma: PrismaService,
  key: string,
): Promise<string> => {
  const r2Settings = await getR2Settings(prisma);
  const r2Client = buildR2Client(r2Settings);

  const archiveKey = `archive/${key}`;

  // Copy to archive location
  await r2Client.send(
    new CopyObjectCommand({
      Bucket: r2Settings.BUCKET_NAME,
      CopySource: `${r2Settings.BUCKET_NAME}/${key}`,
      Key: archiveKey,
    }),
  );

  // Delete the original
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: r2Settings.BUCKET_NAME,
      Key: key,
    }),
  );

  return archiveKey;
};
