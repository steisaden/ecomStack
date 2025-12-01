#!/usr/bin/env node

/**
 * Utility script to generate a bcrypt hash for the admin password
 * Usage: node scripts/generate-admin-hash.js [password]
 * 
 * If no password is provided, it will use the ADMIN_PASSWORD environment variable
 */

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

async function generateHash() {
  try {
    // Get password from command line argument
    const password = process.argv[2];
    
    if (!password) {
      console.error('Error: No password provided.');
      console.log('Usage: node scripts/generate-admin-hash.js [password]');
      process.exit(1);
    }

    console.log('Generating bcrypt hash for admin password...');
    console.log(`Using salt rounds: ${SALT_ROUNDS}`);
    
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    console.log('\n✅ Hash generated successfully!');
    console.log('\nAdd this to your .env.local file:');
    console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
    console.log('\nRemove or comment out the old ADMIN_PASSWORD variable for security.');
    
    // Verify the hash works
    const isValid = await bcrypt.compare(password, hash);
    if (isValid) {
      console.log('\n✅ Hash verification successful!');
    } else {
      console.log('\n❌ Hash verification failed!');
    }
    
  } catch (error) {
    console.error('Error generating hash:', error);
    process.exit(1);
  }
}

generateHash();