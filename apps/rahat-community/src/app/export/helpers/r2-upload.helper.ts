import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SETTINGS_NAMES } from '@rahataid/community-tool-sdk';
import { PrismaService } from '@rumsan/prisma';

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
  if (!setting) throw new Error('Cloudflare R2 settings not found. Please seed R2 settings first.');
  return setting.value as R2Settings;
}

export const uploadToR2 = async (
  prisma: PrismaService,
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<R2UploadResult> => {
  const r2Settings = await getR2Settings(prisma);

  const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${r2Settings.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2Settings.ACCESS_KEY_ID,
      secretAccessKey: r2Settings.SECRET_ACCESS_KEY,
    },
  });

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
