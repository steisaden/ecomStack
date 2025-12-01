#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function generatePasswordHash() {
  console.log('🔐 Admin Password Hash Generator');
  console.log('================================\n');
  
  rl.question('Enter the password you want to use for admin login: ', async (password) => {
    if (!password || password.trim().length === 0) {
      console.log('❌ Password cannot be empty');
      rl.close();
      return;
    }

    if (password.length < 6) {
      console.log('⚠️  Warning: Password is quite short. Consider using a longer password for better security.');
    }

    try {
      console.log('\n🔄 Generating bcrypt hash...');
      const saltRounds = 12;
      const hash = await bcrypt.hash(password, saltRounds);
      
      console.log('\n✅ Password hash generated successfully!');
      console.log('\n📋 Copy this hash to your .env file:');
      console.log('=====================================');
      console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
      console.log('=====================================\n');
      
      console.log('📝 Instructions:');
      console.log('1. Copy the hash above');
      console.log('2. Open your .env file');
      console.log('3. Replace the current ADMIN_PASSWORD_HASH value with the new hash');
      console.log('4. Save the file');
      console.log('5. Restart your development server if it\'s running');
      console.log(`6. Use "${password}" as your admin password when logging in\n`);
      
      console.log('🔒 Security Note: The original password is not stored anywhere - only the hash is used for verification.');
      
    } catch (error) {
      console.error('❌ Error generating hash:', error.message);
    }
    
    rl.close();
  });
}

// Hide password input (basic implementation)
rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted) {
    rl.output.write('*');
  } else {
    rl.output.write(stringToWrite);
  }
};

generatePasswordHash();