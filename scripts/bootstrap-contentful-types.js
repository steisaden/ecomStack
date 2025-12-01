#!/usr/bin/env node

/**
 * CLI tool to create Contentful content types via the bootstrap API
 * 
 * Usage:
 *   node scripts/bootstrap-contentful-types.js
 *   node scripts/bootstrap-contentful-types.js --types=goddessCareProduct,testBlog
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Get the auth token from environment or .env file
let authToken = process.env.AUTH_TOKEN;

// Simple .env parser (since we don't want to add dotenv as a dependency for this script)
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = envContent.split('\n').reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        acc[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
      }
      return acc;
    }, {});
    
    if (envVars.AUTH_TOKEN && !authToken) {
      authToken = envVars.AUTH_TOKEN;
    }
  }
}

function createContentTypes(types = null) {
  // Load environment variables
  loadEnv();
  
  if (!authToken) {
    console.error('Error: AUTH_TOKEN is required. Please set it in your .env file or as an environment variable.');
    process.exit(1);
  }
  
  const postData = types ? JSON.stringify({ types }) : JSON.stringify({});
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/contentful/bootstrap',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': `Bearer ${authToken}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.success) {
          console.log('Content types created successfully!');
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.error('Failed to create content types:');
          console.error(JSON.stringify(result, null, 2));
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        console.error('Response data:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error making request:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure your Next.js development server is running on port 3000');
    }
  });

  req.write(postData);
  req.end();
}

// Parse command line arguments
const args = process.argv.slice(2);
let types = null;

for (const arg of args) {
  if (arg.startsWith('--types=')) {
    types = arg.split('=')[1].split(',');
  }
}

createContentTypes(types);
