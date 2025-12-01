#!/usr/bin/env node

const http = require('http');

async function testDebugAuth() {
  console.log('🔍 Testing Debug Auth Endpoint\n');
  
  const postData = JSON.stringify({
    username: 'admin',
    password: 'password'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/debug-auth/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\nResponse:');
        try {
          const jsonData = JSON.parse(data);
          console.log(JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log(data);
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.error(`Request error: ${e.message}`);
      reject(e);
    });
    
    req.write(postData);
    req.end();
  });
}

testDebugAuth().catch(console.error);