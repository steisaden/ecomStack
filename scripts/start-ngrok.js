#!/usr/bin/env node

/**
 * Script to start ngrok tunnel for local development
 */

const { spawn } = require('child_process');
const fs = require('fs');

// Check if ngrok is installed
function checkNgrokInstallation() {
  return new Promise((resolve) => {
    const ngrokCheck = spawn('ngrok', ['version'], { shell: true });
    
    ngrokCheck.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

// Install ngrok if not present
async function ensureNgrok() {
  const isInstalled = await checkNgrokInstallation();
  
  if (!isInstalled) {
    console.log('Ngrok not found. Installing...');
    const install = spawn('npm', ['install', '-g', 'ngrok'], { stdio: 'inherit', shell: true });
    
    return new Promise((resolve, reject) => {
      install.on('close', (code) => {
        if (code === 0) {
          console.log('Ngrok installed successfully!');
          resolve(true);
        } else {
          reject(new Error('Failed to install ngrok'));
        }
      });
    });
  }
  
  return true;
}

// Start ngrok tunnel
function startNgrok() {
  console.log('Starting ngrok tunnel...');
  console.log('Make sure your Next.js app is running on port 3000');
  console.log('Press Ctrl+C to stop the tunnel');
  
  const ngrok = spawn('ngrok', ['http', '3000'], { stdio: 'inherit', shell: true });
  
  ngrok.on('close', (code) => {
    console.log(`Ngrok process exited with code ${code}`);
  });
}

// Main function
async function main() {
  try {
    console.log('Setting up ngrok tunnel for local development...');
    
    // Check if we're on the correct Node.js version
    const nodeVersion = process.version;
    console.log(`Node.js version: ${nodeVersion}`);
    
    // Ensure ngrok is installed
    await ensureNgrok();
    
    // Start ngrok
    startNgrok();
  } catch (error) {
    console.error('Error setting up ngrok:', error.message);
    console.log('\nAlternative manual setup:');
    console.log('1. Install ngrok globally: npm install -g ngrok');
    console.log('2. Start your Next.js app: npm run dev');
    console.log('3. In a new terminal, run: ngrok http 3000');
  }
}

if (require.main === module) {
  main();
}