import { PrismaClient, SettingDataType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const setting = {
    name: 'AI_API_URL',
    dataType: SettingDataType.OBJECT,
    requiredFields: ['URL'],
    value: {
      URL: 'https://ct-api.askbhunte.com',
    },
    isPrivate: false,
  };

  await prisma.setting.upsert({
    where: { name: setting.name },
    update: setting,
    create: setting,
  });

  console.log('==== AI_API_URL Setting seed completed ====');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
