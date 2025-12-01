import { createClient, ContentType } from 'contentful-management';
import * as fs from 'fs/promises';
import { validateEnvironmentVariables } from '../utils/env';
import { validateContentTypeExists } from './validation';

// Proper TypeScript interfaces instead of 'any'
export interface FieldDefinition {
  id: string;
  name: string;
  type: string;
  required: boolean;
  localized: boolean;
  validations?: any[];
  disabled?: boolean;
  omitted?: boolean;
  items?: {
    type: string;
    linkType?: string;
  };
  linkType?: string;
}

export interface ContentTypeDefinition {
  sys: {
    id: string;
  };
  name: string;
  description?: string;
  displayField?: string;
  fields: FieldDefinition[];
}

export interface BackupResult {
  contentTypeId: string;
  backupPath: string;
  timestamp: string;
}

validateEnvironmentVariables([
  'CONTENTFUL_MANAGEMENT_TOKEN',
  'CONTENTFUL_SPACE_ID',
]);

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

// Helper for retry logic with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.response?.status === 429 || error.response?.status >= 500)) {
      console.warn(`Retrying after error: ${error.message}. Retries left: ${retries}`);
      await new Promise(res => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Creates a new content type in Contentful.
 * @param contentTypeDefinition The definition of the content type to create.
 * @returns A promise that resolves to the created ContentType.
 */
export async function createContentType(contentTypeDefinition: ContentTypeDefinition): Promise<ContentType> {
  try {
    console.log(`Creating content type: ${contentTypeDefinition.sys.id}`);
    
    // Integrate with validation service from Task 6
    const exists = await validateContentTypeExists(contentTypeDefinition.sys.id);
    if (exists) {
      throw new Error(`Content type ${contentTypeDefinition.sys.id} already exists`);
    }

    return await withRetry(async () => {
      const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
      const environment = await space.getEnvironment('master');
      const contentType = await environment.createContentType(contentTypeDefinition);
      await contentType.publish();
      console.log(`Successfully created and published content type: ${contentTypeDefinition.sys.id}`);
      return contentType;
    });
  } catch (error: any) {
    console.error(`Failed to create content type ${contentTypeDefinition.sys.id}:`, {
      error: error.message,
      stack: error.stack,
      contentTypeId: contentTypeDefinition.sys.id,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Content type creation failed for ${contentTypeDefinition.sys.id}: ${error.message}`);
  }
}

/**
 * Adds a new field to an existing content type in Contentful.
 * @param contentTypeId The ID of the content type to add the field to.
 * @param fieldDefinition The definition of the field to create.
 * @returns A promise that resolves when the field is added and the content type is published.
 */
export async function createField(contentTypeId: string, fieldDefinition: FieldDefinition): Promise<void> {
  try {
    console.log(`Adding field ${fieldDefinition.id} to content type: ${contentTypeId}`);
    
    return await withRetry(async () => {
      const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
      const environment = await space.getEnvironment('master');
      const contentType = await environment.getContentType(contentTypeId);
      
      // Check if field already exists
      const existingField = contentType.fields.find(field => field.id === fieldDefinition.id);
      if (existingField) {
        throw new Error(`Field ${fieldDefinition.id} already exists in content type ${contentTypeId}`);
      }
      
      contentType.fields.push(fieldDefinition);
      
      // Set display field if this is the first field or if specified
      if (!contentType.displayField || fieldDefinition.id === 'title') {
        contentType.displayField = fieldDefinition.id;
      }

      await contentType.update();
      await contentType.publish();
      console.log(`Successfully added field ${fieldDefinition.id} to content type: ${contentTypeId}`);
    });
  } catch (error: any) {
    console.error(`Failed to add field ${fieldDefinition.id} to content type ${contentTypeId}:`, {
      error: error.message,
      stack: error.stack,
      contentTypeId,
      fieldId: fieldDefinition.id,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Field creation failed for ${fieldDefinition.id} in ${contentTypeId}: ${error.message}`);
  }
}

/**
 * Fetches and saves a content type definition as a backup.
 * @param contentTypeId The ID of the content type to backup.
 * @returns A promise that resolves to backup information.
 */
export async function backupContentType(contentTypeId: string): Promise<BackupResult> {
  try {
    console.log(`Creating backup for content type: ${contentTypeId}`);
    
    return await withRetry(async () => {
      const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
      const environment = await space.getEnvironment('master');
      const contentType = await environment.getContentType(contentTypeId);
      
      const backupDir = './contentful-backups';
      await fs.mkdir(backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = `${backupDir}/${contentTypeId}-${timestamp}.json`;
      
      const backupData = {
        contentType: contentType.toPlainObject(),
        backupTimestamp: new Date().toISOString(),
        backupVersion: '1.0.0'
      };
      
      await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));
      console.log(`Successfully backed up content type '${contentTypeId}' to ${filePath}`);
      
      return {
        contentTypeId,
        backupPath: filePath,
        timestamp: new Date().toISOString()
      };
    });
  } catch (error: any) {
    console.error(`Failed to backup content type ${contentTypeId}:`, {
      error: error.message,
      stack: error.stack,
      contentTypeId,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Content type backup failed for ${contentTypeId}: ${error.message}`);
  }
}

