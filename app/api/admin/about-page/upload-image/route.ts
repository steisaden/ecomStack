// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'contentful-management'

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    // Check if management token is configured
    if (!process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
      return NextResponse.json(
        { error: 'Contentful Management API token not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get Contentful space and environment
    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!)
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || 'master'
    )

    // Upload asset to Contentful
    const asset = await environment.createAssetFromFiles({
      fields: {
        title: {
          'en-US': file.name || 'About Page Image'
        },
        description: {
          'en-US': 'About page hero image'
        },
        file: {
          'en-US': {
            contentType: file.type,
            fileName: file.name,
            file: bytes as any // Use bytes (ArrayBuffer) directly, cast to any to be safe or rely on type
          }
        }
      }
    })

    // Process the asset
    await asset.processForAllLocales()

    // Wait for processing to complete
    let processedAsset = await environment.getAsset(asset.sys.id)
    let attempts = 0
    while (!processedAsset.fields.file?.['en-US']?.url && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      processedAsset = await environment.getAsset(asset.sys.id)
      attempts++
    }

    // Publish the asset
    await processedAsset.publish()

    // Get the About page entry by ID (we know it's 'about')
    const aboutEntry = await environment.getEntry('about')

    // Update the image field
    aboutEntry.fields.image = {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: processedAsset.sys.id
        }
      }
    }

    // Update and publish
    const updatedEntry = await aboutEntry.update()
    await updatedEntry.publish()

    return NextResponse.json({
      success: true,
      message: 'Image uploaded and updated successfully',
      imageUrl: processedAsset.fields.file?.['en-US']?.url
    })
  } catch (error: any) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}
