'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Info, Image as ImageIcon, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminAIRulesPage() {
  const [imageRules, setImageRules] = useState({
    style: 'natural, organic, beauty-focused',
    colorPalette: 'warm earth tones, sage green, soft neutrals',
    mood: 'calm, luxurious, wellness-oriented',
    avoidTerms: 'synthetic, harsh, clinical',
    brandKeywords: 'goddess, natural beauty, self-care, radiance',
    aspectRatio: '1:1',
    quality: 'high quality, professional photography'
  })

  const [textRules, setTextRules] = useState({
    tone: 'warm, inviting, empowering',
    brandVoice: 'authentic, knowledgeable, supportive',
    titleStyle: 'clear, benefit-focused, natural',
    descriptionStyle: 'informative, engaging, honest',
    tagGuidelines: 'relevant, specific, searchable',
    avoidWords: 'cheap, fake, miracle, instant',
    maxTitleLength: '60',
    maxDescriptionLength: '160'
  })
  
  const [loadingImage, setLoadingImage] = useState(false)
  const [loadingText, setLoadingText] = useState(false)

  useEffect(() => {
    loadImageRules()
    loadTextRules()
  }, [])

  const loadImageRules = async () => {
    try {
      const response = await fetch('/api/admin/ai-rules/image-generator', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.rules) {
          setImageRules(data.rules)
        }
      }
    } catch (error) {
      console.error('Error loading image rules:', error)
    }
  }

  const loadTextRules = async () => {
    try {
      const response = await fetch('/api/admin/ai-rules/text-generator', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.rules) {
          setTextRules(data.rules)
        }
      }
    } catch (error) {
      console.error('Error loading text rules:', error)
    }
  }

  const handleSaveImageRules = async () => {
    try {
      setLoadingImage(true)
      const response = await fetch('/api/admin/ai-rules/image-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rules: imageRules })
      })

      if (!response.ok) throw new Error('Failed to save rules')

      toast.success('Image generator rules saved successfully')
    } catch (error) {
      console.error('Error saving image rules:', error)
      toast.error('Failed to save image generator rules')
    } finally {
      setLoadingImage(false)
    }
  }

  const handleSaveTextRules = async () => {
    try {
      setLoadingText(true)
      const response = await fetch('/api/admin/ai-rules/text-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rules: textRules })
      })

      if (!response.ok) throw new Error('Failed to save rules')

      toast.success('Text generator rules saved successfully')
    } catch (error) {
      console.error('Error saving text rules:', error)
      toast.error('Failed to save text generator rules')
    } finally {
      setLoadingText(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">AI Controls</p>
          <h1 className="text-3xl font-bold text-beauty-dark">AI System Rules</h1>
          <p className="text-muted-foreground mt-2">
            Customize AI behavior for image generation and other AI-powered features.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Text Generator Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <CardTitle>Text Generator Rules</CardTitle>
            </div>
            <CardDescription>
              Define guidelines for AI-generated titles, descriptions, slugs, and tags
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone & Voice</Label>
                <Input
                  id="tone"
                  value={textRules.tone}
                  onChange={(e) => setTextRules({ ...textRules, tone: e.target.value })}
                  placeholder="e.g., warm, professional, friendly"
                />
                <p className="text-xs text-muted-foreground">
                  Overall tone for all generated text
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandVoice">Brand Voice</Label>
                <Input
                  id="brandVoice"
                  value={textRules.brandVoice}
                  onChange={(e) => setTextRules({ ...textRules, brandVoice: e.target.value })}
                  placeholder="e.g., authentic, empowering"
                />
                <p className="text-xs text-muted-foreground">
                  Your unique brand personality
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleStyle">Title Style</Label>
                <Input
                  id="titleStyle"
                  value={textRules.titleStyle}
                  onChange={(e) => setTextRules({ ...textRules, titleStyle: e.target.value })}
                  placeholder="e.g., clear, benefit-focused"
                />
                <p className="text-xs text-muted-foreground">
                  How product titles should be written
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionStyle">Description Style</Label>
                <Input
                  id="descriptionStyle"
                  value={textRules.descriptionStyle}
                  onChange={(e) => setTextRules({ ...textRules, descriptionStyle: e.target.value })}
                  placeholder="e.g., informative, engaging"
                />
                <p className="text-xs text-muted-foreground">
                  How descriptions should be crafted
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagGuidelines">Tag Guidelines</Label>
              <Input
                id="tagGuidelines"
                value={textRules.tagGuidelines}
                onChange={(e) => setTextRules({ ...textRules, tagGuidelines: e.target.value })}
                placeholder="e.g., relevant, specific, searchable"
              />
              <p className="text-xs text-muted-foreground">
                Rules for generating product tags
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avoidWords">Words to Avoid</Label>
              <Input
                id="avoidWords"
                value={textRules.avoidWords}
                onChange={(e) => setTextRules({ ...textRules, avoidWords: e.target.value })}
                placeholder="e.g., cheap, fake, miracle"
              />
              <p className="text-xs text-muted-foreground">
                Words that don't align with your brand
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTitleLength">Max Title Length</Label>
                <Input
                  id="maxTitleLength"
                  type="number"
                  value={textRules.maxTitleLength}
                  onChange={(e) => setTextRules({ ...textRules, maxTitleLength: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Characters (SEO optimal: 50-60)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDescriptionLength">Max Description Length</Label>
                <Input
                  id="maxDescriptionLength"
                  type="number"
                  value={textRules.maxDescriptionLength}
                  onChange={(e) => setTextRules({ ...textRules, maxDescriptionLength: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Characters (SEO optimal: 150-160)
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveTextRules} disabled={loadingText}>
                <Save className="h-4 w-4 mr-2" />
                {loadingText ? 'Saving...' : 'Save Text Rules'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Generator Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-purple-600" />
              <CardTitle>Image Generator Rules</CardTitle>
            </div>
            <CardDescription>
              Define style guidelines and preferences for AI-generated product images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="style">Visual Style</Label>
              <Input
                id="style"
                value={imageRules.style}
                onChange={(e) => setImageRules({ ...imageRules, style: e.target.value })}
                placeholder="e.g., natural, organic, minimalist"
              />
              <p className="text-xs text-muted-foreground">
                Describe the overall aesthetic and visual approach
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorPalette">Color Palette</Label>
              <Input
                id="colorPalette"
                value={imageRules.colorPalette}
                onChange={(e) => setImageRules({ ...imageRules, colorPalette: e.target.value })}
                placeholder="e.g., warm earth tones, pastels"
              />
              <p className="text-xs text-muted-foreground">
                Preferred colors and color combinations
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">Mood & Atmosphere</Label>
              <Input
                id="mood"
                value={imageRules.mood}
                onChange={(e) => setImageRules({ ...imageRules, mood: e.target.value })}
                placeholder="e.g., calm, luxurious, energetic"
              />
              <p className="text-xs text-muted-foreground">
                The emotional tone and feeling of the images
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandKeywords">Brand Keywords</Label>
              <Input
                id="brandKeywords"
                value={imageRules.brandKeywords}
                onChange={(e) => setImageRules({ ...imageRules, brandKeywords: e.target.value })}
                placeholder="e.g., goddess, natural beauty, wellness"
              />
              <p className="text-xs text-muted-foreground">
                Keywords that represent your brand identity
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avoidTerms">Terms to Avoid</Label>
              <Input
                id="avoidTerms"
                value={imageRules.avoidTerms}
                onChange={(e) => setImageRules({ ...imageRules, avoidTerms: e.target.value })}
                placeholder="e.g., synthetic, harsh, clinical"
              />
              <p className="text-xs text-muted-foreground">
                Styles or elements to exclude from generated images
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                <select
                  id="aspectRatio"
                  value={imageRules.aspectRatio}
                  onChange={(e) => setImageRules({ ...imageRules, aspectRatio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="1:1">Square (1:1)</option>
                  <option value="4:3">Standard (4:3)</option>
                  <option value="16:9">Wide (16:9)</option>
                  <option value="3:4">Portrait (3:4)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Quality Level</Label>
                <select
                  id="quality"
                  value={imageRules.quality}
                  onChange={(e) => setImageRules({ ...imageRules, quality: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="high quality, professional photography">High Quality</option>
                  <option value="ultra high quality, 8k, detailed">Ultra High Quality</option>
                  <option value="standard quality">Standard Quality</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveImageRules} disabled={loadingImage}>
                <Save className="h-4 w-4 mr-2" />
                {loadingImage ? 'Saving...' : 'Save Image Rules'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
