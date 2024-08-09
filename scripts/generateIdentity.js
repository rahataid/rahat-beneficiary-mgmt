const { generatePrivateKey, privateKeyToAccount } = require('viem/accounts');
const fs = require('fs');
const dotenv = require('dotenv');

// Generate a private key
const privateKey = generatePrivateKey();
const data = privateKeyToAccount(privateKey);
console.log('PUBLIC KEY: ', data.address);

// Load existing environment variables
dotenv.config();

const envFilePath = '.env';

// Read the existing .env file
let envFileContent = '';
try {
  envFileContent = fs.readFileSync(envFilePath, 'utf8');
} catch (error) {
  console.error('Error reading .env file:', error);
}

// Parse the .env file content into an object
const envVars = dotenv.parse(envFileContent);

// Update or add the relevant keys
envVars.PRIVATE_KEY = privateKey;
envVars.ACCOUNT_ADDRESS = data.address;
// Convert the envVars object back to a string
const updatedEnvFileContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Write the updated content back to the .env file
fs.writeFileSync(envFilePath, updatedEnvFileContent, { encoding: 'utf8' });

console.log('=====Private key generated and saved to .env file=====');
