const contentfulManagement = require('contentful-management');
require('dotenv').config({ path: '.env' });

async function listContentTypes() {
  try {
    const client = contentfulManagement.createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || 'master'
    );

    console.log('Fetching content types...\n');
    const contentTypes = await environment.getContentTypes();

    console.log(`Found ${contentTypes.items.length} content types:\n`);
    contentTypes.items.forEach(ct => {
      console.log(`- ${ct.sys.id} (${ct.name})`);
      console.log(`  Fields: ${ct.fields.map(f => f.id).join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error listing content types:', error.message);
    process.exit(1);
  }
}

listContentTypes();
