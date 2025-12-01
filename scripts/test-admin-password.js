#!/usr/bin/env node

const bcrypt = require('bcryptjs');

// Get the current hash from environment
const currentHash = "$2b$12$wBCWWGA00uXftk027pvYcOXge.Ha/ENsQrqHLMBQnQkeZSau5NOFi";

// Common passwords to test
const commonPasswords = [
  'password',
  'admin',
  'Password',
  'Admin',
  '123456',
  'password123',
  'admin123',
  'goddess',
  'Goddess',
  'beauty',
  'Beauty'
];

async function testPasswords() {
  console.log('🔍 Testing common passwords against your current hash...\n');
  
  for (const password of commonPasswords) {
    try {
      const isMatch = await bcrypt.compare(password, currentHash);
      if (isMatch) {
        console.log(`✅ FOUND! Your current password is: "${password}"`);
        console.log('\nYou can now use this password to log into the admin panel.');
        return;
      } else {
        console.log(`❌ "${password}" - no match`);
      }
    } catch (error) {
      console.log(`❌ "${password}" - error testing`);
    }
  }
  
  console.log('\n🤷 None of the common passwords matched.');
  console.log('\nTo set a new password:');
  console.log('1. Choose a password you want to use');
  console.log('2. Run: node scripts/generate-new-hash.js [your-password]');
  console.log('3. Update your .env file with the new hash');
}

testPasswords();