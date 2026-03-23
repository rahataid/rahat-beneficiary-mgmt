import { PrismaClient, SettingDataType } from '@prisma/client';

const CLOUDFLARE_R2 = 'CLOUDFLARE_R2';

const settingsData = [
  {
    name: CLOUDFLARE_R2,
    dataType: SettingDataType.OBJECT,
    requiredFields: [
      'ACCOUNT_ID',
      'ACCESS_KEY_ID',
      'SECRET_ACCESS_KEY',
      'BUCKET_NAME',
    ],
    value: {
      ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
      ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
      SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
      BUCKET_NAME: process.env.R2_BUCKET_NAME || '',
    },
    isPrivate: true,
    isReadOnly: false,
  },
];

const prisma = new PrismaClient();

async function main() {
  for (const setting of settingsData) {
    await prisma.setting.upsert({
      where: { name: setting.name },
      update: setting,
      create: setting,
    });
  }
  console.log('====Cloudflare R2 settings feed completed====');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
