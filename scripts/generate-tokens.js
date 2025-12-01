#!/usr/bin/env node

/**
 * Utility script to generate secure tokens for environment variables
 */

const crypto = require('crypto');

function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

console.log(`
===============================
Secure Token Generator
===============================

Use these tokens for your environment variables:

AUTH_TOKEN=${generateToken()}
JWT_SECRET=${generateToken()}

You can run this script again to generate new tokens if needed:
node scripts/generate-tokens.js
`);