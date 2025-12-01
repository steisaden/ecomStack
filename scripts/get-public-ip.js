#!/usr/bin/env node

/**
 * Script to get public IP address
 */

const https = require('https');

function getPublicIP() {
  console.log('Getting your public IP address...');
  
  https.get('https://api.ipify.org', (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Your public IP address is: ${data}`);
      console.log(`\nYou can share this IP with your client along with the port number.`);
      console.log(`For example: http://${data}:3000 (if your Next.js app is running on port 3000)`);
      console.log(`\nNote: This will only work if your router/firewall allows external access to port 3000.`);
    });
  }).on('error', (err) => {
    console.error('Error getting public IP:', err.message);
    console.log('Try visiting https://www.whatismyip.com/ in your browser instead.');
  });
}

if (require.main === module) {
  getPublicIP();
}
