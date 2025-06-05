#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Speech-to-Text Setup Validation\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found');
  console.log('📝 Please create a .env.local file with the following variables:');
  console.log(`
OPENAI_API_KEY=your_openai_api_key_here
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
POSTGRES_URL=your_neon_database_url_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
`);
  process.exit(1);
}

console.log('✅ .env.local file found');

// Load environment variables
require('dotenv').config({ path: envPath });

const checks = [
  {
    name: 'OpenAI API Key',
    key: 'OPENAI_API_KEY',
    value: process.env.OPENAI_API_KEY,
    required: true,
    description: 'Get from https://platform.openai.com/api-keys'
  },
  {
    name: 'Vercel Blob Token',
    key: 'BLOB_READ_WRITE_TOKEN',
    value: process.env.BLOB_READ_WRITE_TOKEN,
    required: true,
    description: 'Get from Vercel Dashboard > Storage > Blob'
  },
  {
    name: 'Database URL',
    key: 'POSTGRES_URL',
    value: process.env.POSTGRES_URL,
    required: true,
    description: 'Get from Neon Dashboard > Connection String'
  },
  {
    name: 'App URL',
    key: 'NEXT_PUBLIC_APP_URL',
    value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    required: false,
    description: 'Application URL (defaults to localhost:3000)'
  }
];

let allGood = true;

checks.forEach(check => {
  const status = check.value ? '✅' : (check.required ? '❌' : '⚠️');
  const value = check.value ? '(configured)' : '(missing)';
  
  console.log(`${status} ${check.name}: ${value}`);
  
  if (check.required && !check.value) {
    console.log(`   📝 ${check.description}`);
    allGood = false;
  }
});

console.log('');

if (allGood) {
  console.log('🎉 All required configuration is set!');
  console.log('🚀 You can now run: npm run dev');
} else {
  console.log('🔧 Please configure the missing environment variables');
  console.log('📚 Check the README.md for detailed setup instructions');
  process.exit(1);
} 