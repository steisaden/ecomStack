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

async function resolveYogaTypeIds(client) {
  try {
    const types = await client.getContentTypes();
    const items = types.items || [];
    const pick = (preferredId, displayName) => {
      const byId = items.find(t => t?.sys?.id === preferredId);
      if (byId) return byId.sys.id;
      const byName = items.find(t => String(t?.name || '').toLowerCase() === displayName.toLowerCase());
      if (byName) return byName.sys.id;
      return preferredId; // fallback
    };
    return {
      yogaService: pick('yogaService', 'Yoga Service'),
      addOnExperience: pick('addOnExperience', 'Add-On Experience'),
    };
  } catch (e) {
    return { yogaService: 'yogaService', addOnExperience: 'addOnExperience' };
  }
}

async function checkYogaContentTypes() {
  loadEnvFile();
  
  console.log('🔍 Checking Yoga Content Types\n');
  
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  
  if (!spaceId || !accessToken) {
    console.log('❌ Missing Contentful credentials in .env file');
    return;
  }
  
  try {
    const client = contentful.createClient({
      space: spaceId,
      accessToken: accessToken,
    });
    
    console.log('\n🧪 Testing Yoga Content Types:');
    console.log('===================================');

    const ids = await resolveYogaTypeIds(client);
    console.log('Resolved content type IDs:', ids);
    
    const tests = [
      { key: 'yogaService', id: ids.yogaService },
      { key: 'addOnExperience', id: ids.addOnExperience },
    ];
    
    for (const t of tests) {
      try {
        const result = await client.getEntries({ content_type: t.id, limit: 1 });
        if (result.items.length > 0) {
          console.log(`✅ ${t.key} (${t.id}): ${result.items.length} entries found`);
        } else {
          console.log(`ℹ️ ${t.key} (${t.id}): No entries found`);
        }
      } catch (error) {
        console.log(`❌ ${t.key} (${t.id}): ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error connecting to Contentful:', error.message);
  }
}

checkYogaContentTypes();
