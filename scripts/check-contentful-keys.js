require('dotenv').config();
const contentful = require('contentful');
const contentfulManagement = require('contentful-management');

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const DELIVERY_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const PREVIEW_TOKEN = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

async function checkKeys() {
  console.log('--- Contentful Key Diagnostic Script ---\n');

  if (!SPACE_ID) {
    console.log('❌ ERROR: CONTENTFUL_SPACE_ID is not defined in your .env file.');
    return;
  }

  // 1. Test Delivery API Token
  console.log('1. Testing Content Delivery API Token...');
  if (!DELIVERY_TOKEN) {
    console.log('   ❌ FAILURE: CONTENTFUL_ACCESS_TOKEN is not defined.\n');
  } else {
    try {
      const deliveryClient = contentful.createClient({
        space: SPACE_ID,
        accessToken: DELIVERY_TOKEN,
      });
      await deliveryClient.getSpace();
      console.log('   ✅ SUCCESS: Content Delivery API Token is valid.\n');
    } catch (error) {
      console.log('   ❌ FAILURE: Content Delivery API Token is invalid.');
      console.log(`     Error: ${error.message}\n`);
    }
  }

  // 2. Test Preview API Token
  console.log('2. Testing Content Preview API Token...');
  if (!PREVIEW_TOKEN) {
    console.log('   ❌ FAILURE: CONTENTFUL_PREVIEW_ACCESS_TOKEN is not defined.\n');
  } else {
    try {
      const previewClient = contentful.createClient({
        space: SPACE_ID,
        accessToken: PREVIEW_TOKEN,
        host: 'preview.contentful.com',
      });
      await previewClient.getSpace();
      console.log('   ✅ SUCCESS: Content Preview API Token is valid.\n');
    } catch (error) {
      console.log('   ❌ FAILURE: Content Preview API Token is invalid.');
      console.log(`     Error: ${error.message}\n`);
    }
  }

  // 3. Test Management API Token
  console.log('3. Testing Content Management API Token...');
  if (!MANAGEMENT_TOKEN) {
    console.log('   ❌ FAILURE: CONTENTFUL_MANAGEMENT_TOKEN is not defined.\n');
  } else {
    try {
      const managementClient = contentfulManagement.createClient({
        accessToken: MANAGEMENT_TOKEN,
      });
      await managementClient.getSpace(SPACE_ID);
      console.log('   ✅ SUCCESS: Content Management API Token is valid.\n');
    } catch (error) {
      console.log('   ❌ FAILURE: Content Management API Token is invalid.');
      console.log(`     Error: ${error.message}\n`);
    }
  }

  console.log('--- Diagnostic Complete ---');
}

checkKeys();
