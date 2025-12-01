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
import { X, Sparkles } from 'lucide-react';
import { BackToAdminButton } from '@/components/admin/BackToAdminButton';

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingTag, setGeneratingTag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);

  // State for blog post form
  const [formData, setFormData] = useState<Omit<BlogPost, 'sys' | 'content'>>({
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
          currentValue: field === 'content' ? content.content[0]?.content[0]?.value || '' : formData[field as keyof typeof formData] || '',
          title: formData.title || '',
          excerpt: formData.excerpt || ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const result = await response.json();
      
      // Update the appropriate field based on the field type
      if (field === 'title') {
        setFormData(prev => ({ ...prev, title: result.content }));
      } else if (field === 'excerpt') {
        setFormData(prev => ({ ...prev, excerpt: result.content }));
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

  const generateFeaturedImage = async () => {
    setGeneratingImage(true);
    try {
      // Generate image based on the blog post topic
      const prompt = `${formData.title || 'Stunning visual concept'}, ${formData.excerpt || 'compelling concept'}. Creative, artistic, professional quality image for blog featured image.`;

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
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const result = await response.json();
      
      // Check if result has a valid imageUrl before attempting to fetch
      if (!result.imageUrl) {
        throw new Error(result.error || 'No image URL returned from API');
      }
      
      // Validate that the result contains a proper data URL (base64 encoded image)
      if (!result.imageUrl.startsWith('data:image/')) {
        // If it's not a data URL, validate as HTTP/HTTPS URL
        try {
          new URL(result.imageUrl);
        } catch (urlError) {
          console.error('Invalid image URL:', result.imageUrl);
          throw new Error('Invalid image URL format returned from API');
        }
      }
      
      // Create a blob from the image URL and convert to File
      let imageResponse;
      try {
        imageResponse = await fetch(result.imageUrl);
      } catch (fetchError) {
        console.error('Failed to fetch image from URL:', result.imageUrl, fetchError);
        throw new Error('Failed to download generated image. The service may be temporarily unavailable.');
      }
      
      if (!imageResponse.ok) {
        console.error('Image fetch response not ok:', imageResponse.status, imageResponse.statusText);
        throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], `featured-image-${Date.now()}.png`, { type: 'image/png' });
      
      // Add to files array for upload to Contentful
      setFiles(prev => [...prev, imageFile]);
      
      // Update blog post state to include the generated image with dimensions from API
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          url: result.imageUrl,
          title: `Featured image for ${formData.title || 'blog post'}`,
          description: `Featured image generated for the blog post`,
          width: result.width || width || 1200,
          height: result.height || height || 630,
          contentType: 'image/png'
        }
      }));

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
          title: formData.title || '',
          excerpt: formData.excerpt || ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate tag');
      }

      const result = await response.json();
      
      // Add the generated tag to the form data with comma splitting
      if (result.content) {
        // Split tags by comma and process each individually
        const newTags = result.content.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag && !formData.tags?.includes(tag));
        
        if (newTags.length > 0) {
          setFormData(prev => ({
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

  useEffect(() => {
    // Fetch the blog post data to populate the form
    async function fetchBlogPost() {
      try {
        const response = await fetch(`/api/contentful/blog-posts/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }
        const data = await response.json();
        
        if (data) {
          setBlogPost(data);
          setFormData({
            title: data.title || '',
            excerpt: data.excerpt || '',
            featuredImage: data.featuredImage,
            author: data.author,
            categories: data.categories || [],
            tags: data.tags || [],
            publishedAt: data.publishedAt || new Date().toISOString(),
            slug: data.slug || '',
            likes: data.likes || 0,
            views: data.views || 0,
          });
          
          // Set content if available
          if (data.content) {
            setContent(data.content);
          }
        }
      } catch (err: any) {
        console.error('Error fetching blog post:', err);
        setError(err.message);
        toast.error('Failed to load blog post');
      }
    }

    fetchBlogPost();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Comprehensive form validation
      const errors = [];

      if (!formData.title.trim()) {
        errors.push('Blog post title is required');
      }

      if (!formData.slug.trim()) {
        errors.push('Slug is required');
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
        errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
      }

      if (!formData.excerpt.trim()) {
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
      // 3. Update the blog post with references to those assets

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
      const blogPostPayload = {
        blogPostData: {
          ...formData,
          content: content,
        },
        assetIds: uploadedAssets,
      };

      const response = await fetch(`/api/admin/blog-posts/${params.id}`, {
        method: 'PUT', // Use PUT for update
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogPostPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update blog post');
      }

      // Show success message
      toast.success('Blog post updated successfully');

      // Redirect to admin blog posts page on success
      router.push('/admin');
      router.refresh(); // Refresh to show the updated blog post
    } catch (err: any) {
      console.error('Error updating blog post:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to update blog post');
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagsInput.trim()) {
      // Split tags by comma and process each individually
      const newTags = tagsInput.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !formData.tags?.includes(tag));
      
      if (newTags.length > 0) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), ...newTags]
        }));
        setTagsInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addCategory = () => {
    if (categoriesInput.trim() && !formData.categories?.includes({ name: categoriesInput.trim(), slug: categoriesInput.trim().toLowerCase().replace(/\s+/g, '-') })) {
      setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      categories: prev.categories?.filter(cat => cat.name !== categoryName) || []
    }));
  };

  if (!blogPost && error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Error Loading Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <BackToAdminButton className="mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!blogPost && !error) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <LoadingSpinner size={32} label="Loading blog post..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Blog Post</CardTitle>
          <CardDescription>Update your blog post content and metadata</CardDescription>
        </CardHeader>
        <CardContent>
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
                  onClick={() => generateContentWithAI('title', formData.title || '')}
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
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="Enter blog post title"
                disabled={generatingTitle}
              />
            </div>

            {/* Blog Post Slug */}
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                required
                placeholder="e.g. how-to-grow-your-business"
              />
            </div>

            {/* Excerpt */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => generateContentWithAI('excerpt', formData.excerpt || '')}
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
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                rows={3}
                required
                placeholder="Brief summary of the blog post"
                disabled={generatingExcerpt}
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
                {formData.categories?.map((category, index) => (
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
                {formData.tags?.map((tag, index) => (
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
                value={formData.publishedAt ? formData.publishedAt.substring(0, 16) : ''}
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
            <div className="flex justify-between items-center">
              <BackToAdminButton />
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LoadingSpinner size={16} className="mr-2" />
                      Updating...
                    </>
                  ) : 'Update Blog Post'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}