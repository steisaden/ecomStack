import { createClient, ContentType } from 'contentful-management';
import { validateEnvironmentVariables } from '../utils/env';

validateEnvironmentVariables([
  'CONTENTFUL_MANAGEMENT_TOKEN',
  'CONTENTFUL_SPACE_ID',
]);

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

/**
 * Fetches all content types from the Contentful space.
 * @returns A promise that resolves to an array of content types.
 */
export async function getContentTypes(): Promise<ContentType[]> {
  const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
  const environment = await space.getEnvironment('master');
  const contentTypes = await environment.getContentTypes();
  return contentTypes.items;
}

/**
 * Validates if a specific content type exists in the Contentful space.
 * @param typeName The ID of the content type to validate.
 * @returns A promise that resolves to true if the content type exists, false otherwise.
 */
export async function validateContentTypeExists(typeName: string): Promise<boolean> {
  const contentTypes = await getContentTypes();
  return contentTypes.some(ct => ct.sys.id === typeName);
}

/**
 * Compares the fields of an existing content type against a list of expected fields.
 * @param typeName The ID of the content type to check.
 * @param expectedFields An array of strings representing the expected field IDs.
 * @returns A promise that resolves to an array of missing field IDs.
 */
export async function getMissingFields(typeName: string, expectedFields: string[]): Promise<string[]> {
  const contentTypes = await getContentTypes();
  const contentType = contentTypes.find(ct => ct.sys.id === typeName);

  if (!contentType) {
    throw new Error(`Content type '${typeName}' not found.`);
  }

  const existingFields = contentType.fields.map(field => field.id);
  const missingFields = expectedFields.filter(field => !existingFields.includes(field));

  return missingFields;
}
