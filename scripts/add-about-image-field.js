const contentfulManagement = require('contentful-management');
require('dotenv').config({ path: '.env' });

async function addImageFieldToAboutPage() {
  try {
    const client = contentfulManagement.createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || 'master'
    );

    console.log('Fetching About Page content type...');
    const contentType = await environment.getContentType('2EbnVPoW9gm5IIeei9sZrn');

    // Check if image field already exists
    const imageFieldExists = contentType.fields.some(field => field.id === 'image');
    
    if (imageFieldExists) {
      console.log('✓ Image field already exists in About Page content type');
      return;
    }

    console.log('Adding image field to About Page content type...');

    // Add the image field
    contentType.fields.push({
      id: 'image',
      name: 'Image',
      type: 'Link',
      linkType: 'Asset',
      required: false,
      localized: false,
      disabled: false,
      omitted: false,
      validations: [
        {
          linkMimetypeGroup: ['image']
        }
      ]
    });

    // Update the content type
    const updatedContentType = await contentType.update();
    console.log('✓ Image field added successfully');

    // Publish the content type
    await updatedContentType.publish();
    console.log('✓ Content type published');

    console.log('\n✅ Successfully added image field to About Page content type!');
    console.log('You can now upload images through the admin panel.');

  } catch (error) {
    console.error('❌ Error adding image field:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

addImageFieldToAboutPage();
