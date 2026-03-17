import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export type R2UploadResult = {
  key: string;
  url: string;
};

export const uploadToR2 = async (
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<R2UploadResult> => {
  const bucket = process.env.R2_BUCKET_NAME;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const url = await getSignedUrl(
    r2Client as any,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 3600 },
  );

  return { key, url };
};
