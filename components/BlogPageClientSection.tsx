'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { BlogPost, Category } from '../lib/types'

interface BlogPageClientSectionProps {
  posts: BlogPost[];
}

export default function BlogPageClientSection({ posts }: BlogPageClientSectionProps) {
  if (!posts || posts.length === 0) {
    return (
      <section className="content-section">
        <div className="container px-6">
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-100">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-section mb-4">Coming Soon</h2>
              <p className="text-body mb-6">
                Our wellness blog will feature tips, DIY recipes, yoga practices, and essential oil education to support your natural lifestyle.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const [featured, ...rest] = posts

  return (
    <>
      {/* Featured Article */}
      <section className="pb-10 md:pb-14">
        <div className="container px-6">
          <article className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            {featured.featuredImage && (
              <div className="relative aspect-[16/10] md:aspect-auto">
                <img
                  src={featured.featuredImage.url.startsWith('//') ? `https:${featured.featuredImage.url}` : featured.featuredImage.url}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* Content */}
            <div className="p-6 md:p-8 lg:p-10 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                {featured.tags && featured.tags.length > 0 ? (
                  <Badge variant="sage" className="px-3 py-1">{featured.tags[0]}</Badge>
                ) : featured.categories && featured.categories.length > 0 ? (
                  <Badge variant="sage" className="px-3 py-1">{(featured.categories[0] as Category).name || 'Featured'}</Badge>
                ) : (
                  <Badge variant="sage" className="px-3 py-1">Featured</Badge>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-cecred-chocolate mb-3 md:mb-4">{featured.title}</h2>
              {featured.excerpt && (
                <p className="text-base md:text-lg text-cecred-chocolate/80 mb-5 md:mb-6">{featured.excerpt}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm text-cecred-chocolate/70 mb-6">
                <time dateTime={featured.publishedAt || featured.sys.createdAt}>
                  {new Date(featured.publishedAt || featured.sys.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
                {featured.author?.name && <>
                  <span>•</span>
                  <span>{featured.author.name}</span>
                </>}
              </div>
              <div className="mt-auto">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href={`/blog/${featured.slug}`}>Read Full Article</Link>
                </Button>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Grid of other posts */}
      {rest.length > 0 && (
        <section className="pb-16">
          <div className="container px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rest.map((post) => (
                <article key={post.slug} className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden flex flex-col">
                  {post.featuredImage && (
                    <div className="relative aspect-[16/10]">
                      <img
                        src={post.featuredImage.url.startsWith('//') ? `https:${post.featuredImage.url}` : post.featuredImage.url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {(post.tags && post.tags.length > 0) && (
                      <div className="mb-3">
                        <Badge variant="sage" className="px-3 py-1">{post.tags[0]}</Badge>
                      </div>
                    )}
                    <h3 className="text-lg md:text-xl font-semibold text-cecred-chocolate mb-2 line-clamp-2">{post.title}</h3>
                    {post.excerpt && <p className="text-cecred-chocolate/80 text-sm md:text-base mb-4 line-clamp-3">{post.excerpt}</p>}
                    <div className="flex items-center text-xs text-cecred-chocolate/70 mb-4">
                      <time dateTime={post.publishedAt || post.sys.createdAt}>
                        {new Date(post.publishedAt || post.sys.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </time>
                      {post.author?.name && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{post.author.name}</span>
                        </>
                      )}
                    </div>
                    <Button variant="link" size="sm" asChild className="p-0 h-auto text-emerald-700 hover:underline">
                      <Link href={`/blog/${post.slug}`}>Read More →</Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="pb-24">
        <div className="container px-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 md:p-10 text-center">
            <h2 className="text-section font-heading text-primary mb-4">Stay Updated with Our Wellness Tips</h2>
            <p className="text-emerald-800/80 mb-6 max-w-2xl mx-auto">Get weekly insights on essential oils, yoga practices, and natural wellness delivered straight to your inbox.</p>
            <form className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
              <Input type="email" placeholder="Enter your email address" className="bg-white/90 border-emerald-200 focus-visible:ring-emerald-500" />
              <Button className="bg-emerald-600 hover:bg-emerald-700">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}