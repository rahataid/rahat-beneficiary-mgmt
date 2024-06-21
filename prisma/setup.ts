import { PrismaClient } from '@prisma/client';
import { SYSTEM_DB_FIELDS } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  // ===============Setup system field defs==============
  for (const f of SYSTEM_DB_FIELDS) {
    await prisma.fieldDefinition.upsert({
      where: { name: f.name },
      update: f,
      create: f,
    });
  }
}

main()
  .then(async () => {
    console.log('System fields setup successfully!');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
  });
