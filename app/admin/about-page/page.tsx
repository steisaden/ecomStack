'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface AboutContent {
  title: string
  image?: {
    url: string
    title?: string
  }
}

export default function AboutPageManagement() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })

        if (!response.ok) {
          router.push('/login')
          return
        }

        const userData = await response.json()
        if (!userData.user || (userData.user.role !== 'admin' && userData.user.role !== 'editor')) {
          router.push('/login')
          return
        }

        setUser(userData.user)
        await fetchAboutContent()
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchAboutContent = async () => {
    try {
      const response = await fetch('/api/admin/about-page')
      if (response.ok) {
        const data = await response.json()
        setAboutContent(data)
      }
    } catch (error) {
      console.error('Error fetching about content:', error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/about-page/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Image uploaded successfully!' })
        await fetchAboutContent()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload image' })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage({ type: 'error', text: 'An error occurred while uploading the image' })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">About Page Management</h1>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Current Image Display */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current About Page Image</h2>
        {aboutContent?.image ? (
          <div className="space-y-4">
            <div className="relative w-full max-w-2xl mx-auto">
              <img
                src={aboutContent.image.url}
                alt={aboutContent.image.title || 'About page image'}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              {aboutContent.image.title || 'About page image'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600">No image uploaded yet</p>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="image-upload"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                uploading
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-gray-400 mb-4 animate-spin" />
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                  </>
                )}
              </div>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The uploaded image will replace the current image on the About page.
              For best results, use a high-quality image with a minimum width of 800px.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
