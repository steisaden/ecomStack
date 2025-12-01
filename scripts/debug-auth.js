const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '../.env' });

async function debugAuth() {
  console.log('🔍 GoddessHair Authentication Debug');
  console.log('=====================================');
  
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  
  console.log('Environment Variables:');
  console.log('ADMIN_USERNAME:', adminUsername);
  console.log('ADMIN_PASSWORD_HASH:', adminPasswordHash);
  console.log('Hash length:', adminPasswordHash?.length);
  console.log('');
  
  // Test common passwords that might have been used
  const testPasswords = [
    'password123',
    'admin',
    'admin123',
    'goddess',
    'goddess123',
    'admin@123',
    'password'
  ];
  
  console.log('Testing common passwords against the hash:');
  console.log('==========================================');
  
  for (const testPassword of testPasswords) {
    try {
      const startTime = Date.now();
      const isValid = await bcrypt.compare(testPassword, adminPasswordHash);
      const duration = Date.now() - startTime;
      
      console.log(`Password "${testPassword}": ${isValid ? '✅ MATCH' : '❌ No match'} (${duration}ms)`);
      
      if (isValid) {
        console.log(`\n🎉 SUCCESS! The correct admin password is: "${testPassword}"`);
        break;
      }
    } catch (error) {
      console.log(`Password "${testPassword}": ❌ Error - ${error.message}`);
    }
  }
  
  console.log('\n');
  console.log('Hash Analysis:');
  console.log('==============');
  console.log('Hash format valid:', adminPasswordHash.startsWith('$2b$'));
  console.log('Hash parts:', adminPasswordHash.split('$'));
  
  // Generate a new hash for "password123" to compare
  console.log('\nGenerating new hash for "password123":');
  try {
    const newHash = await bcrypt.hash('password123', 12);
    console.log('New hash:', newHash);
    console.log('New hash validation:', await bcrypt.compare('password123', newHash));
  } catch (error) {
    console.log('Error generating new hash:', error.message);
  }
}

debugAuth().catch(console.error);