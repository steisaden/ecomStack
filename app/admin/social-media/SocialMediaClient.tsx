'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    ExternalLink,
    Save,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'

import LogoutButton from '@/components/LogoutButton'
import { Skeleton } from '@/components/ui/skeleton'

interface SocialMediaSettings {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    tiktok?: string
    patreon?: string
}

interface User {
    username: string;
    role: string;
}

const PLATFORMS = [
    { platform: 'instagram', label: 'Instagram', icon: <Instagram className="h-5 w-5" /> },
    { platform: 'facebook', label: 'Facebook', icon: <Facebook className="h-5 w-5" /> },
    { platform: 'twitter', label: 'Twitter/X', icon: <Twitter className="h-5 w-5" /> },
    { platform: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-5 w-5" /> },
    { platform: 'youtube', label: 'YouTube', icon: <Youtube className="h-5 w-5" /> },
    { platform: 'tiktok', label: 'TikTok', icon: <ExternalLink className="h-5 w-5" /> },
    { platform: 'patreon', label: 'Patreon', icon: <ExternalLink className="h-5 w-5" /> },
]

export default function SocialMediaClient({ user }: { user: User }) {
    const [hydrated, setHydrated] = useState(false)
    const [settings, setSettings] = useState<SocialMediaSettings>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setHydrated(true)
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('/api/admin/social-media')

            if (!response.ok) {
                throw new Error('Failed to fetch social media settings')
            }

            const data = await response.json()
            setSettings(data.settings || {})
        } catch (err: any) {
            console.error('Error fetching social media settings:', err)
            setError(err.message || 'Failed to load social media settings')
            toast.error('Failed to load social media settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            setError(null)

            const response = await fetch('/api/admin/social-media', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ settings }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save social media settings')
            }

            const data = await response.json()
            setSettings(data.settings)
            toast.success('Social media settings saved successfully')
        } catch (err: any) {
            console.error('Error saving social media settings:', err)
            setError(err.message || 'Failed to save social media settings')
            toast.error('Failed to save social media settings')
        } finally {
            setSaving(false)
        }
    }

    const handleUrlChange = (platform: string, url: string) => {
        // Validate URL format if provided
        if (url && url.trim() !== '') {
            try {
                new URL(url)
            } catch (e) {
                // URL is invalid, but we'll still allow the user to type it
                // Validation will happen on save
            }
        }

        setSettings(prev => ({
            ...prev,
            [platform]: url
        }))
    }

    const validateAllUrls = () => {
        for (const [platform, url] of Object.entries(settings)) {
            if (url && url.trim() !== '') {
                try {
                    new URL(url)
                } catch (e) {
                    return false
                }
            }
        }
        return true
    }

    if (!hydrated) return null

    if (loading) {
        return (
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-24 rounded-md" />
                    </div>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-48" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="h-4 w-64" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-hero font-heading text-primary">Social Media Accounts</h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* Controls removed as per request */}
                </div>
            </div>

            {/* Session info for security awareness */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between text-sm text-blue-800">
                    <span>🔒 Secure session active</span>
                    <span>Session expires automatically for security</span>
                </div>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ExternalLink className="h-6 w-6 text-sage-600" />
                        Social Media Accounts
                    </CardTitle>
                    <CardDescription>
                        Manage your social media links. Add the full URL to your profile on each platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                            <p>{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={fetchSettings}
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    <div className="space-y-4">
                        {PLATFORMS.map(({ platform, label, icon }) => (
                            <div key={platform} className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                                    {icon}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor={platform} className="text-sm font-medium">
                                        {label}
                                    </Label>
                                    <Input
                                        id={platform}
                                        type="url"
                                        placeholder={`https://${platform}.com/your-profile`}
                                        value={settings[platform as keyof SocialMediaSettings] || ''}
                                        onChange={(e) => handleUrlChange(platform, e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={fetchSettings}
                        disabled={saving}
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !validateAllUrls()}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
