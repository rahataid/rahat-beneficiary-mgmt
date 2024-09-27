import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const BATCH_SIZE = 50;

function generateRandomPhone() {
  const timestamp = Date.now(); // Get the current timestamp
  const randomPart = Math.floor(Math.random() * 1000000); // Generate a random number between 0 and 999999
  const sevenDigitNumber = ((timestamp + randomPart) % 9000000) + 1000000; // Ensure it's a 7-digit number
  return `999${sevenDigitNumber}`;
}

function findRepeatedPhones(arr: any[]) {
  const phoneCount = {};
  const duplicateData = [];

  // Count the occurrences of each phone number
  arr.forEach((item) => {
    if (phoneCount[item.phone]) {
      phoneCount[item.phone].push(item);
    } else {
      phoneCount[item.phone] = [item];
    }
  });

  // Find phones that are repeated
  for (const phone in phoneCount) {
    if (phoneCount[phone].length > 1) {
      duplicateData.push(...phoneCount[phone]);
    }
  }

  return duplicateData;
}

async function main() {
  const rows = await prisma.beneficiary.findMany({});

  // const duplicates = [];
  // const seenPhones = new Set();

  const dups = findRepeatedPhones(rows);

  // for (let r of rows) {
  //   const { phone } = r;
  //   if (seenPhones.has(phone)) {
  //     duplicates.push(r);
  //   } else {
  //     seenPhones.add(phone);
  //   }
  // }

  // Run cleanup in Batch
  // for (let i = 0; i < duplicates.length; i += BATCH_SIZE) {
  //   const batch = duplicates.slice(i, i + BATCH_SIZE);
  //   await prisma.$transaction(async (txn) => {
  //     await cleanupBatch(txn, batch);
  //     console.log('Cleaned up batch:', i);
  //   });
  // }
  // Export duplicates to excel

  console.log('Duplicates:', dups.length);
}

async function updateBeneficiary(data: any[]) {
  const filePath = path.join(__dirname, 'updatedPhone.json');
  const existingData = await readJsonFile(filePath);
  let updatedIds = [];
  // Read existing phone numbers
  for (const d of data) {
    const ben: any = d;
    const found = await searchPhoneByUniqueId(
      existingData,
      d?.extras?.unique_id,
    );
    const updated = await prisma.beneficiary.update({
      where: {
        uuid: ben.uuid,
      },
      data: {
        phone: found ? found.pii?.phone : generateRandomPhone(),
      },
    });
    updatedIds.push(updated.id);
  }
  console.log('Updated!', updatedIds.length);
  return saveArrayAsJson(updatedIds);
}

async function saveArrayAsJson(data: any[]) {
  const jsonData = JSON.stringify(data, null, 2);
  const filePath = path.join(__dirname, 'updatedBenIds.json');

  // Write JSON data to the file
  fs.writeFileSync(filePath, jsonData);
}

async function searchPhoneByUniqueId(data: [], uniqueId: string) {
  const found = data.find((d: any) => d?.extras?.unique_id === uniqueId);
  if (!found) return null;
  return found;
}

async function readJsonFile(filePath: string) {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  return jsonData;
}

async function saveDuplicatesAsJson(duplicates: any[]) {
  const finalData = spreadExtrasData(duplicates);
  if (!finalData.length) throw new Error('No data to save');
  const jsonData = JSON.stringify(finalData, null, 2);
  const filePath = path.join(__dirname, 'duplicate-phone.json');

  // Write JSON data to the file
  fs.writeFile(filePath, jsonData, (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log(`${duplicates.length} beneficiaries saved successfully!`);
    }
  });
}

function spreadExtrasData(duplicates: any[]) {
  const final = [];
  for (let d of duplicates) {
    delete d.createdAt;
    delete d.updatedAt;
    const { extras, ...rest } = d;
    const newData = { ...rest, ...extras };
    delete newData?._uuid;
    final.push(newData);
  }
  return final;
}

async function cleanupBatch(txn: any, batch: any[]) {
  for (let d of batch) {
    // 1. Remove from Source
    await removeFromSource(txn, d.uuid);
    // 2. Remove from TargetResult
    await removeFromTargetResult(txn, d.uuid);
    // 3. Remove from BenefGroup
    await removeFromBenefGroup(txn, d.uuid);
    // 4. Remove from Beneficiary
    await removeFromBeneficiary(txn, d.uuid);
  }
}

async function removeFromSource(txn: any, benefUID: string) {
  const rows = await txn.beneficiarySource.findMany({
    where: {
      beneficiaryUID: benefUID,
    },
  });
  if (!rows.length) return;
  await txn.beneficiarySource.deleteMany({
    where: {
      beneficiaryUID: benefUID,
    },
  });
}

async function removeFromBenefGroup(txn: any, benefUID: string) {
  const rows = await txn.beneficiaryGroup.findMany({
    where: {
      beneficiaryUID: benefUID,
    },
  });
  if (!rows.length) return;
  await txn.beneficiaryGroup.deleteMany({
    where: {
      beneficiaryUID: benefUID,
    },
  });
}

async function removeFromTargetResult(txn: any, benefUID: string) {
  const rows = await txn.targetResult.findMany({
    where: {
      benefUuid: benefUID,
    },
  });
  if (!rows.length) return;
  await txn.targetResult.deleteMany({
    where: {
      benefUuid: benefUID,
    },
  });
}

async function removeFromBeneficiary(txn: any, benefUID: string) {
  return txn.beneficiary.delete({
    where: {
      uuid: benefUID,
    },
  });
}

main()
  .then()
  .catch((err) => {
    throw err;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
