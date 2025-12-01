import { getBlogPosts } from '../../lib/contentful'
import { BlogPost } from '../../lib/types'
import { createCollectionMetadataGenerator } from '@/lib/seo'
import BlogPageClient from '@/components/BlogPageClient'

// Force dynamic rendering to always fetch fresh blog posts
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const generateMetadata = createCollectionMetadataGenerator(async () => {
  const posts = await getBlogPosts()
  return {
    title: 'Wellness Blog',
    description: 'Discover tips, recipes, and insights about essential oils, yoga, and holistic wellness to enhance your natural living journey.',
    url: '/blog',
    itemCount: posts.length,
  }
})

export default async function BlogPage() {
  let posts: BlogPost[] = []
  
  try {
    posts = await getBlogPosts()
  } catch (error) {
    console.log('Blog posts not yet available:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cecred-cream to-cecred-nude">
      {/* Background intentionally left plain (no paper shader) */}
      <BlogPageClient posts={posts} />
    </div>
  )
}