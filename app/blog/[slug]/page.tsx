import { getBlogPostBySlug, getBlogPosts, getGlobalSettingsService } from '../../../lib/contentful'
import { Category, BlogPost } from '../../../lib/types'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArticleStructuredData } from '@/components/StructuredData'
import { createArticleMetadataGenerator } from '@/lib/seo'

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts()
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    return []
  }
}

export const generateMetadata = createArticleMetadataGenerator(async (params: { slug: string }) => {
  const post = await getBlogPostBySlug(params.slug)
  
  if (!post) {
    return null
  }

  return {
    title: post.title,
    description: post.excerpt,
    image: post.featuredImage ? `https:${post.featuredImage.url}` : undefined,
    publishedTime: post.publishedAt,
    author: post.author?.name,
    tags: post.tags,
    slug: post.slug,
  }
})

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, globalSettings] = await Promise.all([
    getBlogPostBySlug(slug),
    getGlobalSettingsService().getSettingsWithFallback().catch(() => null)
  ])

  if (!post) {
    notFound()
  }

  return (
    <div>
      <ArticleStructuredData
        title={post.title}
        description={post.excerpt}
        url={`/blog/${post.slug}`}
        image={post.featuredImage ? `https:${post.featuredImage.url}` : undefined}
        author={post.author?.name}
        publishedTime={post.publishedAt}
        globalSettings={globalSettings}
      />
      {/* Header with Back Navigation */}
      <section className="content-section bg-light-gray">
        <div className="container">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-gray-600 hover:text-black mb-8 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="aspect-video md:aspect-[21/9] overflow-hidden rounded-lg mb-8">
              <img
                src={post.featuredImage.url.startsWith('//') ? `https:${post.featuredImage.url}` : post.featuredImage.url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Header */}
          <header className="max-w-4xl mx-auto text-center">
            <h1 className="text-hero font-heading text-primary mb-6">{post.title}</h1>
            
            <div className="flex flex-wrap justify-center items-center text-gray-600 text-sm mb-8">
              <time dateTime={post.publishedAt || post.sys?.createdAt}>
                {new Date(post.publishedAt || post.sys?.createdAt || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              
              {post.author && (
                <>
                  <span className="mx-3">•</span>
                  <div className="flex items-center">
                    {post.author.avatar && (
                      <img
                        src={post.author.avatar.url.startsWith('//') ? `https:${post.author.avatar.url}` : post.author.avatar.url}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    <span>{post.author.name}</span>
                  </div>
                </>
              )}
            </div>

            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {post.categories.map((category: Category) => (
                  <span 
                    key={category.slug}
                    className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm border border-gray-200"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </header>
        </div>
      </section>

      {/* Post Content */}
      <article className="content-section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Excerpt */}
            {post.excerpt && (
              <div className="text-lg text-gray-600 mb-12 pb-8 border-b border-gray-200">
                <p className="italic">{post.excerpt}</p>
              </div>
            )}

            {/* Main Content */}
            <div className="prose prose-lg prose-gray max-w-none mb-12">
              {post.content && documentToReactComponents(post.content, {
                renderNode: {
                  // Custom rendering for better styling
                  'embedded-asset-block': (node) => {
                    const asset = node.data.target;
                    // Handle both raw Contentful assets and transformed assets
                    const imageUrl = asset.fields?.file?.url || asset.url;
                    const imageTitle = asset.fields?.title || asset.title;
                    
                    if (!imageUrl) return null;
                    
                    return (
                      <div className="my-8">
                        <img 
                          src={imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl} 
                          alt={imageTitle || ''} 
                          className="w-full rounded-lg shadow-sm"
                        />
                      </div>
                    );
                  },
                }
              })}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="border-t border-gray-200 pt-8 mb-12">
                <h3 className="text-sm font-medium text-gray-900 mb-4 tracking-wide uppercase">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span 
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            {post.author && post.author.bio && (
              <div className="border-t border-gray-200 pt-12">
                <div className="bg-light-gray rounded-lg p-8">
                  <div className="flex items-start space-x-6">
                    {post.author.avatar && (
                      <img
                        src={post.author.avatar.url.startsWith('//') ? `https:${post.author.avatar.url}` : post.author.avatar.url}
                        alt={post.author.name}
                        className="w-20 h-20 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-medium mb-3">About {post.author.name}</h3>
                      <div className="prose prose-gray">
                        {documentToReactComponents(post.author.bio)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Related Posts / Newsletter CTA */}
      <section className="content-section bg-light-gray">
        <div className="container">
          <div className="text-center-section">
            <h2 className="text-section mb-4">
              Enjoyed This Article?
            </h2>
            <p className="text-body mb-8">
              Subscribe to our beauty journal for more tips, tutorials, and natural hair care insights.
            </p>
            <div className="max-w-md mx-auto flex gap-4 mb-8">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
              />
              <button className="btn-primary">
                Subscribe
              </button>
            </div>
            <Link href="/blog" className="btn-secondary">
              Read More Articles
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}