import { Prisma, PrismaClient, Setting, SettingDataType } from '@prisma/client';
import { createInterface } from 'node:readline/promises';

const prisma = new PrismaClient();

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const SMTP_USER = await rl.question('Please enter SMTP_USER: ');
  const SMTP_PASSWORD = await rl.question('Please enter SMTP_PASSWORD: ');

  const settings: Setting[] = [
    {
      value: {
        HOST: 'smtp.gmail.com',
        PORT: 465,
        SECURE: true,
        USERNAME: SMTP_USER,
        PASSWORD: SMTP_PASSWORD,
      } as Prisma.JsonValue,
      isPrivate: true,
      isReadOnly: true,
      name: 'SMTP',
      requiredFields: ['HOST', 'PORT', 'SECURE', 'USERNAME', 'PASSWORD'],
      dataType: SettingDataType.OBJECT,
    },
  ];

  console.log('This is your configuration:');
  console.log(settings);

  const answer = await rl.question('Do you want to proceed? (Y/n) ');
  rl.close();

  if (answer.toLowerCase() === 'n') {
    console.log('Operation cancelled.');
  } else {
    await prisma.setting.createMany({
      // @ts-ignore
      data: settings,
    });
    console.log('Settings have been saved.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
