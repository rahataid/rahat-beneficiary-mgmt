import { PrismaClient, SettingDataType } from '@prisma/client';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { SETTINGS_NAMES } from './seed-data';

const privateKey = generatePrivateKey();
const identity = privateKeyToAccount(privateKey);

console.log('App identity=>', identity.address);

const settingsData = [
  {
    name: SETTINGS_NAMES.APP_IDENTITY,
    dataType: SettingDataType.OBJECT,
    requiredFields: ['PRIVATE_KEY', 'PUBLIC_KEY', 'ADDRESS'],
    value: {
      PRIVATE_KEY: privateKey,
      PUBLIC_KEY: identity.publicKey,
      ADDRESS: identity.address,
    },
  },
];

const prisma = new PrismaClient();

async function main() {
  for (let setting of settingsData) {
    await prisma.setting.upsert({
      where: { name: setting.name },
      update: setting,
      create: setting,
    });
  }
  console.log('====Settings feed completed====');
}

main();
