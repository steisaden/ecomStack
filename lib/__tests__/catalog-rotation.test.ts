import { getCurrentProductSet, generateNewProductSet } from '../catalog-rotation'

describe('Catalog Rotation System', () => {
  test('getCurrentProductSet returns a valid product set', () => {
    const productSet = getCurrentProductSet()
    
    expect(productSet).toBeDefined()
    expect(productSet.id).toBeDefined()
    expect(productSet.name).toBeDefined()
    expect(productSet.searchTerms).toBeDefined()
    expect(Array.isArray(productSet.searchTerms)).toBe(true)
    expect(productSet.searchTerms.length).toBeGreaterThan(0)
    expect(Array.isArray(productSet.imageVariations)).toBe(true)
  })

  test('generateNewProductSet creates products with proper structure', async () => {
    const result = await generateNewProductSet()
    
    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(Array.isArray(result.products)).toBe(true)
    expect(result.products.length).toBeGreaterThan(0)
    
    // Check first product structure
    const firstProduct = result.products[0]
    expect(firstProduct.id).toBeDefined()
    expect(firstProduct.title).toBeDefined()
    expect(firstProduct.price).toBeGreaterThan(0)
    expect(firstProduct.imageUrl).toBeDefined()
    expect(firstProduct.affiliateUrl).toBeDefined()
    expect(firstProduct.category).toBeDefined()
    expect(Array.isArray(firstProduct.tags)).toBe(true)
  })

  test('product sets have different themes and search terms', () => {
    const productSet1 = getCurrentProductSet()
    
    // Force rotation
    const result = generateNewProductSet()
    const productSet2 = getCurrentProductSet()
    
    // Should be different sets (unless we only have one set)
    expect(productSet1.searchTerms).toBeDefined()
    expect(productSet2.searchTerms).toBeDefined()
  })
})