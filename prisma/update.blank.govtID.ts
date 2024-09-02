import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GOVT_ID_BASE = 7777;

async function main() {
  const rows = await prisma.beneficiary.findMany({
    where: {
      govtIDNumber: '',
    },
    select: {
      id: true,
      govtIDNumber: true,
    },
  });

  return updateBlankGovtID(rows);
}

async function updateBlankGovtID(rows: any[]) {
  let counter = 0;
  const attachGovtID = rows.map((row) => {
    const govtIDNumber = `${GOVT_ID_BASE}-${row.id}`;
    return { ...row, govtIDNumber };
  });
  if (!attachGovtID.length) return;

  // for (let d of attachGovtID) {
  //   await prisma.beneficiary.update({
  //     where: { id: d.id },
  //     data: { govtIDNumber: d.govtIDNumber },
  //   });
  //   console.log('Updated=>', counter++, d.id);
  // }
}

main()
  .then()
  .catch((err) => {
    throw err;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
