import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const batchSize = 100;

async function main() {
  const rows: any = await prisma.beneficiary.findMany({
    where: {},
    select: { uuid: true, extras: true },
  });
  if (!rows) return;
  const transformedData = [];
  for (let r of rows) {
    let newData = { ...r };
    const extras = newData.extras || null;
    if (extras) {
      if (extras?.hh_education_qualification) {
        newData.extras.household_head_education_qualification =
          extras.hh_education_qualification;
        delete newData.extras.hh_education_qualification;
      }
      if (extras?.ward_no_) {
        newData.extras.ward_no = extras.ward_no_;
        delete newData.extras.ward_no_;
      }
      if (extras?.hh_government_id_type) {
        newData.extras.household_head_government_id_type =
          extras.hh_government_id_type;
        delete newData.extras.hh_government_id_type;
      }
    }
    transformedData.push({
      uuid: r.uuid,
      extras: newData.extras,
    });
  }
  return updateData(transformedData);
}

async function updateData(data: any) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    // Create an array of update promises
    const updatePromises = batch.map((item) =>
      prisma.beneficiary.update({
        where: { uuid: item.uuid },
        data: {
          extras: item.extras,
        },
      }),
    );

    // Execute all updates in the current batch concurrently
    await Promise.all(updatePromises);

    console.log(`Updated batch ${i / batchSize + 1}`);
  }

  console.log('All data updated successfully!');
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
