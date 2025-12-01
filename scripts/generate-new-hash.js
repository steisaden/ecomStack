#!/usr/bin/env node

const bcrypt = require('bcryptjs');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.log('❌ Please provide a password as an argument');
  console.log('Usage: node scripts/generate-new-hash.js [your-password]');
  console.log('Example: node scripts/generate-new-hash.js myNewPassword123');
  process.exit(1);
}

async function generateHash() {
  try {
    console.log('🔄 Generating bcrypt hash for your password...\n');
    
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ Hash generated successfully!\n');
    console.log('📋 Update your .env file with this line:');
    console.log('==========================================');
    console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
    console.log('==========================================\n');
    
    console.log('📝 Next steps:');
    console.log('1. Copy the hash above');
    console.log('2. Open your .env file');
    console.log('3. Replace the current ADMIN_PASSWORD_HASH value');
    console.log('4. Save the file');
    console.log('5. Restart your dev server if running');
    console.log(`6. Login with password: "${password}"`);
    
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
  }
}

generateHash();