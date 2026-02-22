import { NextRequest } from 'next/server'
import { getCategories, createCategory } from '@/lib/contentful'
import { slugify } from '@/lib/utils'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories()
    
    return Response.json({
      success: true,
      categories,
      count: categories.length
    })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch categories',
        message: error.message || 'An error occurred while fetching categories'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return Response.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      )
    }
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string') {
      return Response.json(
        { 
          success: false, 
          error: 'Invalid input',
          message: 'Category name is required and must be a string'
        },
        { status: 400 }
      )
    }
    
    // Generate slug from name
    const slug = slugify(name)
    
    // Create the category
    const category = await createCategory(name, slug)
    
    if (!category) {
      return Response.json(
        { 
          success: false, 
          error: 'Failed to create category',
          message: 'An error occurred while creating the category'
        },
        { status: 500 }
      )
    }
    
    return Response.json({
      success: true,
      category,
      message: 'Category created successfully'
    })
  } catch (error: any) {
    console.error('Error creating category:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to create category',
        message: error.message || 'An error occurred while creating the category'
      },
      { status: 500 }
    )
  }
}
