#!/usr/bin/env node

async function testServerEnv() {
  console.log('🔍 Testing Server Environment Variables\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/debug-env', {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Server environment variables:', data);
    } else {
      console.log('Debug endpoint not available, creating one...');
    }
  } catch (error) {
    console.log('Could not connect to server or debug endpoint not available');
    console.log('Creating debug endpoint...');
  }
}

testServerEnv();