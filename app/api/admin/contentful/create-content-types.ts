// This file now uses the improved bootstrap API that handles existing content types properly
// The original create-content-types.ts functionality has been moved to the /api/admin/contentful/bootstrap route
// which properly checks for existing content types before creating them

export async function createContentTypes() {
  try {
    // Call the bootstrap API which properly handles existing content types
    const response = await fetch('/api/admin/contentful/bootstrap', { 
      method: 'POST' 
    });
    
    if (!response.ok) {
      throw new Error(`Bootstrap API failed with status ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Bootstrap result:', result);
    return result;
  } catch (error) {
    console.error('Error during content type bootstrap:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createContentTypes().then(() => {
    console.log('Content type creation process completed');
  }).catch(error => {
    console.error('Error during content type creation:', error);
  });
}

export { 
  createContentTypes 
};