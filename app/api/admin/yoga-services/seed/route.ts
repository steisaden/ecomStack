import { NextRequest, NextResponse } from 'next/server'
import { createClient as createManagementClient } from 'contentful-management'
import { createClient as createDeliveryClient } from 'contentful'
import { verifyAuth } from '@/lib/auth'
import { DEV_YOGA_SERVICES, getYogaContentTypeIds } from '@/lib/yoga'
import { revalidateTag } from 'next/cache'

const yogaServiceContentType = {
  sys: { id: 'yogaService' },
  name: 'Yoga Service',
  description: 'Yoga and wellness services offered for booking',
  displayField: 'name',
  fields: [
    { id: 'name', name: 'Name', type: 'Symbol', required: true, localized: false },
    { id: 'slug', name: 'Slug', type: 'Symbol', required: true, localized: false, validations: [{ unique: true }] },
    { id: 'description', name: 'Description', type: 'Text', required: true, localized: false },
    { id: 'price', name: 'Price', type: 'Number', required: true, localized: false },
    { id: 'duration', name: 'Duration (minutes)', type: 'Integer', required: true, localized: false },
    { id: 'category', name: 'Category', type: 'Symbol', required: false, localized: false },
    { id: 'includedAmenities', name: 'Included Amenities', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } },
    { id: 'luxuryFeatures', name: 'Luxury Features', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } },
    { id: 'image', name: 'Image', type: 'Link', required: false, localized: false, linkType: 'Asset' },
    { id: 'displayOrder', name: 'Display Order', type: 'Integer', required: false, localized: false },
  ]
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

    const managementClient = createManagementClient({
      accessToken: (process.env.CONTENTFUL_MANAGEMENT_TOKEN || '').trim()
    })

    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!)
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'
    )

    const contentTypeId = (await getYogaContentTypeIds()).yogaService

    try {
      await environment.getContentType(contentTypeId)
    } catch (error: any) {
      const isNotFound =
        error?.sys?.id === 'notResolvable' ||
        error?.status === 404 ||
        (typeof error?.message === 'string' && error.message.includes('not found'))

      if (!isNotFound) {
        throw error
      }

      const contentType = await environment.createContentTypeWithId(contentTypeId, {
        name: yogaServiceContentType.name,
        description: yogaServiceContentType.description,
        displayField: yogaServiceContentType.displayField,
        fields: yogaServiceContentType.fields
      })
      await contentType.publish()
    }

    const deliveryClient = createDeliveryClient({
      space: (process.env.CONTENTFUL_SPACE_ID || '').trim(),
      accessToken: (process.env.CONTENTFUL_ACCESS_TOKEN || '').trim(),
      environment: (process.env.CONTENTFUL_ENVIRONMENT || process.env.CONTENTFUL_ENVIRONMENT_ID || 'master').trim(),
    })

    const existing = await deliveryClient.getEntries({
      content_type: contentTypeId,
      limit: 1
    })

    if (existing.items?.length) {
      return NextResponse.json({
        success: true,
        message: 'Yoga services already exist in Contentful',
        created: 0
      })
    }

    let createdCount = 0
    for (const service of DEV_YOGA_SERVICES) {
      const entry = await environment.createEntry(contentTypeId, {
        fields: {
          name: { 'en-US': service.name },
          slug: { 'en-US': service.slug },
          description: { 'en-US': service.description },
          price: { 'en-US': service.price },
          duration: { 'en-US': service.duration },
          category: { 'en-US': service.category || 'Private Session' },
          includedAmenities: { 'en-US': service.includedAmenities || [] },
          luxuryFeatures: { 'en-US': service.luxuryFeatures || [] },
          displayOrder: { 'en-US': service.displayOrder || 0 }
        }
      })
      await entry.publish()
      createdCount += 1
    }

    revalidateTag('yoga-services')

    return NextResponse.json({
      success: true,
      message: `Seeded ${createdCount} yoga services`,
      created: createdCount
    })
  } catch (error: any) {
    console.error('Error seeding yoga services:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to seed yoga services' },
      { status: 500 }
    )
  }
}
