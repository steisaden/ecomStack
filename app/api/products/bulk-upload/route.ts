import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'contentful-management'
import { verifyAuth } from '@/lib/auth'

interface BulkProductData {
  title: string
  description: string
  category: string
  price: number
  isAffiliate: boolean
  affiliateUrl?: string
  imageUrl?: string
  tags: string[]
  inStock: boolean
}

interface BulkUploadResult {
  success: boolean
  processed: number
  errors: string[]
  created: number
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      )
    }

    const { products }: { products: BulkProductData[] } = await request.json()

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No products provided' },
        { status: 400 }
      )
    }

    // Validate environment variables
    const spaceId = process.env.CONTENTFUL_SPACE_ID
    const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN
    const environmentId = process.env.CONTENTFUL_ENVIRONMENT || 'master'

    if (!spaceId || !accessToken) {
      return NextResponse.json(
        { success: false, message: 'Contentful configuration missing' },
        { status: 500 }
      )
    }

    // Initialize Contentful Management client
    const client = createClient({
      accessToken: accessToken,
    })

    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment(environmentId)

    const result: BulkUploadResult = {
      success: true,
      processed: 0,
      errors: [],
      created: 0
    }

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      result.processed++

      try {
        // Validate required fields
        if (!product.title || !product.description || !product.category) {
          result.errors.push(`Product ${i + 1}: Missing required fields (title, description, category)`)
          continue
        }

        // Create slug from title
        const slug = product.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()

        // Prepare entry data
        const entryData = {
          fields: {
            title: {
              'en-US': product.title
            },
            slug: {
              'en-US': slug
            },
            description: {
              'en-US': product.description
            },
            price: {
              'en-US': product.price || 0
            },
            inStock: {
              'en-US': product.inStock !== false
            },
            isAffiliate: {
              'en-US': product.isAffiliate || false
            }
          }
        }

        // Add optional fields if schema supports them; ignore if not present
        if (product.affiliateUrl) {
          (entryData.fields as any).affiliateUrl = {
            'en-US': product.affiliateUrl
          }
        }

        if (product.tags && product.tags.length > 0) {
          (entryData.fields as any).tags = {
            'en-US': product.tags
          }
        }

        // Handle category - create category reference if needed
        if (product.category) {
          try {
            // First, try to find existing category
            const categories = await environment.getEntries({
              content_type: 'category',
              'fields.name': product.category,
              limit: 1
            })

            let categoryId: string

            if (categories.items.length > 0) {
              categoryId = categories.items[0].sys.id
            } else {
              // Create new category
              const categorySlug = product.category
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()

              const categoryEntry = await environment.createEntry('category', {
                fields: {
                  name: {
                    'en-US': product.category
                  },
                  slug: {
                    'en-US': categorySlug
                  }
                }
              })

              await categoryEntry.publish()
              categoryId = categoryEntry.sys.id
            }

            (entryData.fields as any).category = {
              'en-US': {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: categoryId
                }
              }
            }
          } catch (categoryError) {
            console.error('Category creation error:', categoryError)
            result.errors.push(`Product ${i + 1}: Failed to create/link category`)
            continue
          }
        }

        // Handle image URL
        if (product.imageUrl) {
          try {
            // For simplicity, we'll store the image URL as a text field
            // In a production system, you might want to upload the image to Contentful
            (entryData.fields as any).imageUrl = {
              'en-US': product.imageUrl
            }
          } catch (imageError) {
            console.error('Image handling error:', imageError)
            // Continue without image rather than failing the entire product
          }
        }

        // Create the product entry
        const entry = await environment.createEntry('goddessCareProduct', entryData)

        // Publish the entry
        await entry.publish()

        result.created++

        console.log(`Successfully created product: ${product.title}`)

      } catch (error) {
        console.error(`Error creating product ${i + 1}:`, error)
        result.errors.push(`Product ${i + 1} (${product.title}): ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Determine overall success
    result.success = result.created > 0

    return NextResponse.json(result)

  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        processed: 0,
        errors: ['Server error occurred'],
        created: 0
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
