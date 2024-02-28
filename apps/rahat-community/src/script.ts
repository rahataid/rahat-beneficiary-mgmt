const fs = require('fs');
const path = require('path');

// Load the existing package.json
const packagePath = path.join(
  __dirname,
  '../../../dist/apps/rahat-community/package.json',
);

// const packagePath =
//   '/home/binod/projects/rumsan/rahat-apps/rahat-beneficiary-mgmt/dist/apps/rahat-community/package.json';

try {
  // Read the package.json file as a JSON object
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Modify package.json as needed
  packageData.scripts = {
    ...packageData.scripts,
    start: 'node main.js',
    'prisma:migrate': 'prisma migrate dev',
    'prisma:generate': 'prisma generate',
  };

  packageData.dependencies = {
    ...packageData.dependencies,
    'prisma-dbml-generator': '^0.10.0',
    'prisma-docs-generator': '^0.8.0',
    prisma: '^5.10.2',
    'ts-node': '10.9.1',
    '@prisma/client': '^5.1.0',
    lodash: '^4.17.21',
    '@types/lodash': '^4.14.202',
  };

  packageData.prisma = {
    seed: 'prisma/seed.ts',
  };

  // Write the updated package.json back to the file
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2), 'utf8');

  console.log('package.json updated successfully.');
} catch (err) {
  console.error('Error updating package.json:', err);
}
