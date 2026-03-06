const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Load .env.bulktest
const envPath = path.resolve(__dirname, '.env.bulktest');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} else {
  console.warn('Warning: .env.bulktest not found at', envPath);
}

// ===== CONFIGURATION =====
const API_BASE_URL = process.env.API_URL || 'http://localhost:5600/api/v1';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';
// ==========================

const FIRST_NAMES = [
  'Ram',
  'Sita',
  'Hari',
  'Gita',
  'Krishna',
  'Radha',
  'Shyam',
  'Anita',
  'Bikash',
  'Sunita',
  'Rajesh',
  'Kamala',
  'Suresh',
  'Laxmi',
  'Mahesh',
  'Parvati',
  'Dinesh',
  'Sarita',
  'Ganesh',
  'Mina',
  'Prakash',
  'Suman',
  'Nabin',
  'Rekha',
  'Dipak',
  'Sabina',
  'Anil',
  'Bindu',
  'Raju',
  'Nisha',
];

const LAST_NAMES = [
  'Sharma',
  'Thapa',
  'Gurung',
  'Tamang',
  'Rai',
  'Magar',
  'Shrestha',
  'Adhikari',
  'Bhandari',
  'Poudel',
  'Karki',
  'Basnet',
  'KC',
  'Ghimire',
  'Dahal',
  'Sapkota',
  'Koirala',
  'Regmi',
  'Neupane',
  'Subedi',
];

const LOCATIONS = [
  'Kathmandu',
  'Lalitpur',
  'Bhaktapur',
  'Pokhara',
  'Biratnagar',
  'Birgunj',
  'Dharan',
  'Butwal',
  'Hetauda',
  'Janakpur',
];

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const BANKED_STATUS = ['UNKNOWN', 'UNBANKED', 'BANKED', 'UNDER_BANKED'];
const INTERNET_STATUS = [
  'UNKNOWN',
  'NO_INTERNET',
  'HOME_INTERNET',
  'MOBILE_INTERNET',
];
const PHONE_STATUS = ['UNKNOWN', 'NO_PHONE', 'FEATURE_PHONE', 'SMART_PHONE'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  return '98' + Math.floor(10000000 + Math.random() * 90000000).toString();
}

function randomDate(startYear = 1960, endYear = 2005) {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear));
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateBeneficiary() {
  const gender = pick(GENDERS);
  const genderIndex = gender === 'FEMALE' ? 1 : 0;
  const firstNames = FIRST_NAMES.filter((_, i) => i % 2 === genderIndex);

  return {
    firstName: pick(firstNames.length ? firstNames : FIRST_NAMES),
    lastName: pick(LAST_NAMES),
    gender,
    birthDate: randomDate(),
    phone: randomPhone(),
    location: pick(LOCATIONS),
    bankedStatus: pick(BANKED_STATUS),
    internetStatus: pick(INTERNET_STATUS),
    phoneStatus: pick(PHONE_STATUS),
  };
}

async function apiCall(method, endpoint, body) {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${endpoint} failed (${res.status}): ${text}`);
  }

  return res.json();
}

async function createGroup(name) {
  console.log(`\nCreating group: "${name}"...`);
  const result = await apiCall('POST', '/group', { name });
  const uuid = result.data?.uuid || result.uuid;
  console.log(`Group created: ${uuid}`);
  return uuid;
}

async function createBeneficiary(data, index, total) {
  const result = await apiCall('POST', '/beneficiaries', data);
  const uuid = result.data?.uuid || result.uuid;
  console.log(
    `  [${index + 1}/${total}] Created: ${data.firstName} ${
      data.lastName
    } -> ${uuid}`,
  );
  return uuid;
}

async function addBeneficiariesToGroup(beneficiaryUIDs, groupUID) {
  console.log(
    `\nAdding ${beneficiaryUIDs.length} beneficiaries to group ${groupUID}...`,
  );
  const result = await apiCall('POST', '/beneficiary-group', {
    beneficiaryUID: beneficiaryUIDs,
    groupUID,
  });
  console.log('Beneficiaries added to group successfully.');
  return result;
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
}

async function main() {
  if (!ACCESS_TOKEN) {
    console.error('ERROR: ACCESS_TOKEN is required.');
    console.error(
      'Usage: ACCESS_TOKEN=<your_token> node bulk-create-beneficiaries.js',
    );
    process.exit(1);
  }

  const countInput = await askQuestion('How many beneficiaries to create? ');
  const count = parseInt(countInput, 10);

  if (isNaN(count) || count < 1) {
    console.error('Please enter a valid number greater than 0.');
    process.exit(1);
  }

  const groupNameInput = await askQuestion(
    `Group name (default: "bulk-test-${Date.now()}"): `,
  );
  const groupName = groupNameInput.trim() || `bulk-test-${Date.now()}`;

  console.log(
    `\n--- Bulk Create: ${count} beneficiaries into group "${groupName}" ---`,
  );

  // Step 1: Create group
  const groupUUID = await createGroup(groupName);

  // Step 2: Create beneficiaries
  console.log(`\nCreating ${count} beneficiaries...`);
  const beneficiaryUUIDs = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = [];
    for (let j = i; j < Math.min(i + BATCH_SIZE, count); j++) {
      const data = generateBeneficiary();
      batch.push(createBeneficiary(data, j, count));
    }
    const uuids = await Promise.all(batch);
    beneficiaryUUIDs.push(...uuids);
  }

  // Step 3: Add all beneficiaries to group
  await addBeneficiariesToGroup(beneficiaryUUIDs, groupUUID);

  console.log(`\n--- Done ---`);
  console.log(`Group UUID:   ${groupUUID}`);
  console.log(`Beneficiaries created: ${beneficiaryUUIDs.length}`);
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
