#!/usr/bin/env node

const contentful = require('contentful');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=');
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.log('Could not load .env file:', error.message);
  }
}

async function checkContentfulTypes() {
  loadEnvFile();
  
  console.log('🔍 Checking Contentful Content Types\n');
  
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  
  if (!spaceId || !accessToken) {
    console.log('❌ Missing Contentful credentials in .env file');
    console.log('CONTENTFUL_SPACE_ID:', spaceId ? 'Set' : 'Missing');
    console.log('CONTENTFUL_ACCESS_TOKEN:', accessToken ? 'Set' : 'Missing');
    return;
  }
  
  console.log('Environment Variables:');
  console.log(`CONTENTFUL_SPACE_ID: ${spaceId}`);
  console.log(`CONTENTFUL_ACCESS_TOKEN: ${accessToken.substring(0, 10)}...`);
  console.log('');
  
  try {
    const client = contentful.createClient({
      space: spaceId,
      accessToken: accessToken,
    });
    
    console.log('📋 Available Content Types:');
    console.log('==========================');
    
    // Try to get content types using the Management API approach
    const entries = await client.getEntries({ limit: 1 });
    console.log(`Total entries in space: ${entries.total}`);
    
    // Get a sample of entries to see what content types exist
    const sampleEntries = await client.getEntries({ limit: 10 });
    const contentTypes = new Set();
    
    sampleEntries.items.forEach(entry => {
      if (entry.sys && entry.sys.contentType && entry.sys.contentType.sys) {
        contentTypes.add(entry.sys.contentType.sys.id);
      }
    });
    
    console.log('\nContent types found in entries:');
    Array.from(contentTypes).forEach(type => {
      console.log(`- ${type}`);
    });
    
    // Test specific content types
    console.log('\n🧪 Testing Specific Content Types:');
    console.log('===================================');
    
    const typesToTest = [
      'globalSettings',
      'goddessCareProduct', 
      'testBlog',
      'aboutPage',
      'socialMediaSettings'
    ];
    
    for (const contentType of typesToTest) {
      try {
        const result = await client.getEntries({
          content_type: contentType,
          limit: 1
        });
        console.log(`✅ ${contentType}: ${result.items.length} entries found`);
      } catch (error) {
        console.log(`❌ ${contentType}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error connecting to Contentful:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

checkContentfulTypes();