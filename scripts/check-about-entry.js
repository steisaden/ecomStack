const contentfulManagement = require('contentful-management');
require('dotenv').config({ path: '.env' });

async function checkAboutEntry() {
  try {
    const client = contentfulManagement.createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || 'master'
    );

    // Check content type first
    console.log('Checking About Page content type...\n');
    const contentType = await environment.getContentType('2EbnVPoW9gm5IIeei9sZrn');
    console.log('Content Type Fields:');
    contentType.fields.forEach(field => {
      console.log(`  - ${field.id} (${field.name}) - Type: ${field.type}`);
    });

    // Find the about entry
    console.log('\nFetching About Page entry...\n');
    const entries = await environment.getEntries({
      content_type: '2EbnVPoW9gm5IIeei9sZrn',
      'fields.slug': 'about',
      limit: 1
    });

    if (entries.items.length === 0) {
      console.log('❌ No About Page entry found with slug "about"');
      
      // List all entries of this type
      const allEntries = await environment.getEntries({
        content_type: '2EbnVPoW9gm5IIeei9sZrn',
        limit: 10
      });
      
      console.log(`\nFound ${allEntries.items.length} entries of this type:`);
      allEntries.items.forEach(entry => {
        console.log(`  - ID: ${entry.sys.id}, Slug: ${entry.fields.slug?.['en-US'] || 'N/A'}`);
      });
      return;
    }

    const entry = entries.items[0];
    console.log('Entry Details:');
    console.log(`  ID: ${entry.sys.id}`);
    console.log(`  Version: ${entry.sys.version}`);
    console.log(`  Published: ${entry.sys.publishedVersion ? 'Yes' : 'No'}`);
    console.log('\nEntry Fields:');
    Object.keys(entry.fields).forEach(fieldId => {
      console.log(`  - ${fieldId}: ${entry.fields[fieldId]['en-US'] ? 'Has value' : 'Empty'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

checkAboutEntry();
