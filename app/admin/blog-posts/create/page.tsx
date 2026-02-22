'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlogPost } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { X, Sparkles, Download } from 'lucide-react';


export default function CreateBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingTag, setGeneratingTag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authors, setAuthors] = useState<Array<{ id: string; name: string }>>([]);

  // State for blog post form
  const [blogPost, setBlogPost] = useState<Omit<BlogPost, 'sys' | 'content'>>({
    title: '',
    excerpt: '',
    featuredImage: undefined,
    author: undefined,
    categories: [],
    tags: [],
    publishedAt: new Date().toISOString(),
    slug: '',
    likes: 0,
    views: 0,
  });

  // State for content (in rich text format)
  const [content, setContent] = useState<any>({
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: '',
            marks: [],
            data: {},
          },
        ],
      },
    ],
  });

  // State for file uploads
  const [files, setFiles] = useState<File[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing authors on component mount
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch('/api/admin/authors');
        if (response.ok) {
          const data = await response.json();
          setAuthors(data.authors || []);
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };
    fetchAuthors();
  }, []);

  const generateContentWithAI = async (field: string, context: string = '') => {
    try {
      // Set loading state for the specific field
      if (field === 'title') setGeneratingTitle(true);
      if (field === 'content') setGeneratingContent(true);
      if (field === 'excerpt') setGeneratingExcerpt(true);

      const response = await fetch('/api/openai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field,
          context,
          currentValue: field === 'content' ? content.content[0]?.content[0]?.value || '' : blogPost[field as keyof typeof blogPost] || '',
          title: blogPost.title || '',
          excerpt: blogPost.excerpt || ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const result = await response.json();

      // Update the appropriate field based on the field type
      if (field === 'title') {
        setBlogPost(prev => ({ ...prev, title: result.content }));
      } else if (field === 'excerpt') {
        setBlogPost(prev => ({ ...prev, excerpt: result.content }));
      } else if (field === 'content') {
        const newContent = {
          ...content,
          content: [
            {
              ...content.content[0],
              content: [
                {
                  ...content.content[0].content[0],
                  value: result.content
                }
              ]
            }
          ]
        };
        setContent(newContent);
      }

      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} generated successfully`);
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error(`Failed to generate ${field}. ${error.message || 'Please try again.'}`);
    } finally {
      // Reset loading state
      if (field === 'title') setGeneratingTitle(false);
      if (field === 'content') setGeneratingContent(false);
      if (field === 'excerpt') setGeneratingExcerpt(false);
    }
  };

  // Extract plain text from the rich text JSON structure
  const extractPlainText = (node: any): string => {
    if (!node) return '';
    if (Array.isArray(node)) return node.map(extractPlainText).join(' ');
    if (node.value) return node.value;
    if (node.content) return extractPlainText(node.content);
    return '';
  };

  // Build an image prompt grounded in the blog body
  const buildImagePrompt = () => {
    const title = blogPost.title || 'Blog post';
    const excerpt = blogPost.excerpt || '';
    const bodyText = extractPlainText(content).replace(/\s+/g, ' ').trim();
    const summary = (bodyText || excerpt).slice(0, 600);
    const categories = blogPost.categories
      ?.map((c) => (typeof c === 'string' ? c : c.name))
      .filter(Boolean)
      .join(', ');

    return [
      `Featured image for a blog titled "${title}".`,
      summary ? `Summary: ${summary}` : null,
      categories ? `Categories/themes: ${categories}.` : null,
      'Style: editorial, photorealistic, soft natural light, high detail, 1200x630.',
      'Family-friendly, no text, no logos.'
    ]
      .filter(Boolean)
      .join(' ');
  };

  const generateFeaturedImage = async () => {
    setGeneratingImage(true);
    try {
      const prompt = buildImagePrompt();

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          width: 1200,
          height: 630,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || errorData.details || 'Failed to generate image';
        throw new Error(message);
      }

      const result = await response.json();

      // Check if result has a valid imageUrl before attempting to fetch
      if (!result.success || !result.imageUrl) {
        throw new Error(result.error || result.details || 'No image URL returned from API');
      }

      // For data URLs (base64), convert directly to blob
      if (result.imageUrl.startsWith('data:image/')) {
        // Extract base64 data from data URL
        const base64Data = result.imageUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const imageBlob = new Blob([byteArray], { type: 'image/png' });
        const imageFile = new File([imageBlob], `featured-image-${Date.now()}.png`, { type: 'image/png' });

        // Add to files array for upload to Contentful
        setFiles(prev => [...prev, imageFile]);

        // Update blog post state to include the generated image
        setBlogPost(prev => ({
          ...prev,
          featuredImage: {
            url: result.imageUrl,
            title: `Featured image for ${blogPost.title || 'blog post'}`,
            description: `Featured image generated for the blog post`,
            width: result.width || 1200,
            height: result.height || 630,
            contentType: 'image/png'
          }
        }));
      } else {
        // For regular URLs, fetch the image
        try {
          const imageResponse = await fetch(result.imageUrl);

          if (!imageResponse.ok) {
            console.error('Image fetch response not ok:', imageResponse.status, imageResponse.statusText);
            throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
          }

          const imageBlob = await imageResponse.blob();
          const imageFile = new File([imageBlob], `featured-image-${Date.now()}.png`, { type: 'image/png' });

          // Add to files array for upload to Contentful
          setFiles(prev => [...prev, imageFile]);

          // Update blog post state to include the generated image
          setBlogPost(prev => ({
            ...prev,
            featuredImage: {
              url: result.imageUrl,
              title: `Featured image for ${blogPost.title || 'blog post'}`,
              description: `Featured image generated for the blog post`,
              width: result.width || 1200,
              height: result.height || 630,
              contentType: 'image/png'
            }
          }));
        } catch (fetchError: any) {
          console.error('Failed to fetch image from URL:', result.imageUrl, fetchError);
          throw new Error('Failed to download generated image. The service may be temporarily unavailable.');
        }
      }

      toast.success('Featured image generated successfully');
    } catch (error: any) {
      console.error('Error generating featured image:', error);
      toast.error('Failed to generate featured image. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const generateTagWithAI = async () => {
    setGeneratingTag(true);
    try {
      const response = await fetch('/api/openai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: 'tags',
          context: tagsInput,
          currentValue: tagsInput,
          title: blogPost.title || '',
          excerpt: blogPost.excerpt || ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate tag');
      }

      const result = await response.json();

      // Add the generated tag to the blog post with comma splitting
      if (result.content) {
        // Split tags by comma and process each individually
        const newTags = result.content.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag && !blogPost.tags?.includes(tag));

        if (newTags.length > 0) {
          setBlogPost(prev => ({
            ...prev,
            tags: [...(prev.tags || []), ...newTags]
          }));
        }
      }

      toast.success('Tag generated successfully');
    } catch (error: any) {
      console.error('Error generating tag:', error);
      toast.error('Failed to generate tag. Please try again.');
    } finally {
      setGeneratingTag(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Comprehensive form validation
      const errors = [];

      if (!blogPost.title.trim()) {
        errors.push('Blog post title is required');
      }

      if (!blogPost.slug.trim()) {
        errors.push('Slug is required');
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(blogPost.slug)) {
        errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
      }

      if (!blogPost.excerpt.trim()) {
        errors.push('Excerpt is required');
      }

      if (!content || !content.content || content.content.length === 0) {
        errors.push('Content is required');
      }

      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }

      // If there are files to upload, we need to:
      // 1. Upload each file as an asset to Contentful
      // 2. Get the asset IDs
      // 3. Create the blog post with references to those assets

      // Array to hold references to uploaded asset IDs
      const assetIds = [];
      const uploadedAssets = [];

      if (files.length > 0) {
        for (const file of files) {
          const assetFormData = new FormData();
          assetFormData.append('file', file);

          const assetResponse = await fetch('/api/admin/upload-asset', {
            method: 'POST',
            body: assetFormData,
          });

          if (!assetResponse.ok) {
            const assetError = await assetResponse.json();
            throw new Error(`Failed to upload image: ${assetError.error || 'Unknown error'}`);
          }

          // Get the uploaded asset
          const assetResult = await assetResponse.json();
          uploadedAssets.push(assetResult.asset);
          assetIds.push(assetResult.asset);
          console.log('Uploaded asset:', assetResult.asset);
        }
      }

      // Prepare blog post data with asset IDs
      // Use default author
      const blogPostPayload = {
        blogPostData: {
          ...blogPost,
          content: content,
        },
        assetIds: uploadedAssets,
        authorName: 'Goddess Care Team',
      };

      const response = await fetch('/api/admin/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogPostPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Check for specific error types
        if (result.details?.errors?.[0]?.name === 'unique') {
          throw new Error(`A blog post with the slug "${blogPost.slug}" already exists. Please use a different slug.`);
        }
        throw new Error(result.error || result.details || 'Failed to create blog post');
      }

      // Show success message
      toast.success('Blog post created successfully');

      // Redirect to admin blog posts page on success
      router.push('/admin');
      router.refresh(); // Refresh to show the new blog post
    } catch (err: any) {
      console.error('Error creating blog post:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to create blog post');
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: keyof Omit<BlogPost, 'sys' | 'content'>, value: any) => {
    setBlogPost(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title if title is being changed and slug is empty
    if (field === 'title' && !blogPost.slug) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setBlogPost(prev => ({
        ...prev,
        slug: autoSlug
      }));
    }
  };

  const addTag = () => {
    if (tagsInput.trim()) {
      // Split tags by comma and process each individually
      const newTags = tagsInput.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !blogPost.tags?.includes(tag));

      if (newTags.length > 0) {
        setBlogPost(prev => ({
          ...prev,
          tags: [...(prev.tags || []), ...newTags]
        }));
        setTagsInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setBlogPost(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addCategory = () => {
    if (categoriesInput.trim() && !blogPost.categories?.includes({ name: categoriesInput.trim(), slug: categoriesInput.trim().toLowerCase().replace(/\s+/g, '-') })) {
      setBlogPost(prev => ({
        ...prev,
        categories: [
          ...(prev.categories || []),
          {
            name: categoriesInput.trim(),
            slug: categoriesInput.trim().toLowerCase().replace(/\s+/g, '-')
          }
        ]
      }));
      setCategoriesInput('');
    }
  };

  const removeCategory = (categoryName: string) => {
    setBlogPost(prev => ({
      ...prev,
      categories: prev.categories?.filter(cat => cat.name !== categoryName) || []
    }));
  };

  return (
    <div className="container mx-auto py-6 sm:py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>

          <h1 className="text-2xl font-heading text-primary">Create New Blog Post</h1>
          <p className="text-beauty-muted mt-2">Add a new blog post to your content library</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Blog Post Title */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="title">Title *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => generateContentWithAI('title', blogPost.title || '')}
                    disabled={generatingTitle}
                    className="flex items-center gap-1"
                  >
                    {generatingTitle ? (
                      <LoadingSpinner size={16} className="mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate with AI
                  </Button>
                </div>
                <Input
                  id="title"
                  type="text"
                  value={blogPost.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  placeholder="Enter blog post title"
                  disabled={generatingTitle}
                  maxLength={60}
                />
              </div>

              {/* Blog Post Slug */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const autoSlug = blogPost.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      // Add timestamp to make it unique
                      const uniqueSlug = `${autoSlug}-${Date.now()}`;
                      handleInputChange('slug', uniqueSlug);
                    }}
                    disabled={!blogPost.title}
                    className="text-xs"
                  >
                    Generate Unique Slug
                  </Button>
                </div>
                <Input
                  id="slug"
                  type="text"
                  value={blogPost.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  required
                  placeholder="e.g. how-to-grow-your-business"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be unique. Use lowercase letters, numbers, and hyphens only.
                </p>
              </div>

              {/* Author Display (Read-only) */}
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  type="text"
                  value={authors.length > 0 ? authors[0].name : 'Goddess Care Team'}
                  disabled
                  className="mt-2 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  All blog posts are authored by the default author
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => generateContentWithAI('excerpt', blogPost.excerpt || '')}
                    disabled={generatingExcerpt}
                    className="flex items-center gap-1"
                  >
                    {generatingExcerpt ? (
                      <LoadingSpinner size={16} className="mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate with AI
                  </Button>
                </div>
                <Textarea
                  id="excerpt"
                  value={blogPost.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  required
                  placeholder="Brief summary of the blog post"
                  disabled={generatingExcerpt}
                  maxLength={150}
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="content">Content *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => generateContentWithAI('content', content.content[0]?.content[0]?.value || '')}
                    disabled={generatingContent}
                    className="flex items-center gap-1"
                  >
                    {generatingContent ? (
                      <LoadingSpinner size={16} className="mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate with AI
                  </Button>
                </div>
                <Textarea
                  id="content"
                  value={content.content[0]?.content[0]?.value || ''}
                  onChange={(e) => {
                    // Update the content in the rich text structure
                    const newContent = {
                      ...content,
                      content: [
                        {
                          ...content.content[0],
                          content: [
                            {
                              ...content.content[0].content[0],
                              value: e.target.value
                            }
                          ]
                        }
                      ]
                    };
                    setContent(newContent);
                  }}
                  rows={8}
                  required
                  placeholder="Write your blog post content here..."
                  disabled={generatingContent}
                />
              </div>

              {/* Categories */}
              <div>
                <Label htmlFor="categories">Categories</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="categories"
                    type="text"
                    value={categoriesInput}
                    onChange={(e) => setCategoriesInput(e.target.value)}
                    placeholder="Add a category"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCategory}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {blogPost.categories?.map((category, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {typeof category === 'string' ? category : category.name}
                      <button
                        type="button"
                        onClick={() => removeCategory(typeof category === 'string' ? category : category.name)}
                        className="ml-1 text-destructive hover:text-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateTagWithAI}
                    disabled={generatingTag}
                    className="flex items-center gap-1"
                  >
                    {generatingTag ? (
                      <LoadingSpinner size={16} className="mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate SEO Tag
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="tags"
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Add a tag"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {blogPost.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-destructive hover:text-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Publication Date */}
              <div>
                <Label htmlFor="publishedAt">Publication Date</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={blogPost.publishedAt ? blogPost.publishedAt.substring(0, 16) : ''}
                  onChange={(e) => handleInputChange('publishedAt', e.target.value + ':00.000Z')}
                />
              </div>

              {/* Featured Image Upload */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Featured Image</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateFeaturedImage}
                    disabled={generatingImage}
                    className="flex items-center gap-1"
                  >
                    {generatingImage ? (
                      <LoadingSpinner size={16} className="mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate Image
                  </Button>
                </div>
                <div className="mt-2">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  {files.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Selected Images:</h4>
                      <div className="flex flex-wrap gap-4">
                        {files.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="border rounded-lg overflow-hidden w-32 h-32">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                              {file.name}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                  {loading ? (
                    <>
                      <LoadingSpinner size={16} className="mr-2" />
                      Creating...
                    </>
                  ) : 'Create Blog Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
