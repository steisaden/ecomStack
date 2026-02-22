'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface AboutContent {
    title: string
    image?: {
        url: string
        title?: string
    }
}

interface User {
    username: string;
    role: string;
}

export default function AboutPageClient({ user }: { user: User }) {
    const [aboutContent, setAboutContent] = useState<AboutContent | null>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [savingText, setSavingText] = useState(false)

    // Text form state
    const [formData, setFormData] = useState({
        title: '',
        mission: '',
        vision: '',
        mainContent: ''
    })

    // Helper to extract flat text from Contentful rich text
    const extractPlainText = (richText: any) => {
        if (!richText || !richText.content) return ''
        try {
            return richText.content.map((node: any) => {
                if (node.nodeType === 'paragraph') {
                    return node.content.map((textNode: any) => textNode.value || '').join('')
                }
                return ''
            }).filter((text: string) => text.trim() !== '').join('\n\n')
        } catch (e) {
            return ''
        }
    }

    useEffect(() => {
        fetchAboutContent()
    }, [])

    const fetchAboutContent = async () => {
        try {
            const response = await fetch('/api/admin/about-page')
            if (response.ok) {
                const data = await response.json()
                setAboutContent(data)
                setFormData({
                    title: data.title || '',
                    mission: data.mission || '',
                    vision: data.vision || '',
                    mainContent: extractPlainText(data.mainContent)
                })
            }
        } catch (error) {
            console.error('Error fetching about content:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleTextSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSavingText(true)
        setMessage(null)

        try {
            const response = await fetch('/api/admin/about-page', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()
            if (response.ok) {
                setMessage({ type: 'success', text: 'About page content updated successfully!' })
                await fetchAboutContent() // Refresh to get exact contentful representation
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update content' })
            }
        } catch (error) {
            console.error('Error updating text:', error)
            setMessage({ type: 'error', text: 'An unexpected error occurred while saving.' })
        } finally {
            setSavingText(false)
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
                    className={`mb-6 p-4 rounded-md ${message.type === 'success'
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

            {/* Text Edit Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Edit Content</h2>
                <form onSubmit={handleTextSave} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Page Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-1">
                            Mission Statement (Optional)
                        </label>
                        <textarea
                            id="mission"
                            value={formData.mission}
                            onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
                        />
                    </div>

                    <div>
                        <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-1">
                            Vision Statement (Optional)
                        </label>
                        <textarea
                            id="vision"
                            value={formData.vision}
                            onChange={(e) => setFormData(prev => ({ ...prev, vision: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
                        />
                    </div>

                    <div>
                        <label htmlFor="mainContent" className="block text-sm font-medium text-gray-700 mb-1">
                            Main Story / Content (Separated by newlines for paragraphs)
                        </label>
                        <textarea
                            id="mainContent"
                            value={formData.mainContent}
                            onChange={(e) => setFormData(prev => ({ ...prev, mainContent: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 min-h-[250px]"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={savingText}
                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingText ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Content'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                        <label
                            htmlFor="image-upload"
                            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploading
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
