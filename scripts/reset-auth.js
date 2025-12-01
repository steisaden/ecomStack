// Simple script to reset authentication status
// Run with: node scripts/reset-auth.js

const fs = require('fs');
const path = require('path');

// Path to the auth state file
const AUTH_STATE_FILE = path.join(__dirname, '../.auth-state.json');

// Reset the auth state
const resetAuthState = () => {
  const authState = {
    blocked: false,
    retryAfter: 0,
    failedAttempts: 0
  };
  
  try {
    // Write the reset state to the file
    fs.writeFileSync(AUTH_STATE_FILE, JSON.stringify(authState, null, 2));
    console.log('Authentication state reset successfully!');
    console.log('You can now log in again.');
  } catch (error) {
    console.error('Error resetting authentication state:', error);
  }
};

// Execute the reset
resetAuthState();