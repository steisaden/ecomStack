import { createClient } from 'contentful-management';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const managementClient = createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

async function migrateAffiliateProducts() {
    console.log('Starting migration of affiliate products...');

    try {
        const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
        const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

        const entries = await environment.getEntries({
            content_type: 'affiliateProduct',
            limit: 1000,
        });

        for (const entry of entries.items) {
            let needsUpdate = false;

            if (!entry.fields.imageRefreshStatus) {
                entry.fields.imageRefreshStatus = { 'en-US': 'current' };
                needsUpdate = true;
            }
            if (!entry.fields.linkValidationStatus) {
                entry.fields.linkValidationStatus = { 'en-US': 'valid' };
                needsUpdate = true;
            }
            if (!entry.fields.needsReview) {
                entry.fields.needsReview = { 'en-US': false };
                needsUpdate = true;
            }

            if (needsUpdate) {
                console.log(`Updating entry: ${entry.sys.id}`);
                const updatedEntry = await entry.update();
                await updatedEntry.publish();
                console.log(`Entry ${entry.sys.id} updated and published.`);
            } else {
                console.log(`Entry ${entry.sys.id} already has the new fields.`);
            }
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateAffiliateProducts();
