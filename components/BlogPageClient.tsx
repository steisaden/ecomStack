"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { motionVariants } from "@/lib/cecred-design"
import { scrollMotionVariants } from "@/lib/motion-utils"
import BlogPageClientSection from '@/components/BlogPageClientSection'
import { BlogPost } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface BlogPageClientProps {
  posts: BlogPost[]
}

export default function BlogPageClient({ posts }: BlogPageClientProps) {
  const [selectedTag, setSelectedTag] = React.useState<string>('All Posts')

  const tags = React.useMemo(() => {
    // Build frequency map in a single pass, then sort desc by count and take top 5
    const counts = new Map<string, number>()
    for (const p of posts) {
      for (const t of (p.tags || [])) {
        if (!t) continue
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
    const top = Array.from(counts.entries())
      .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([tag]) => tag)

    return ['All Posts', ...top]
  }, [posts])

  // Ensure selected tag remains valid when the list of tags changes
  React.useEffect(() => {
    if (selectedTag !== 'All Posts' && !tags.includes(selectedTag)) {
      setSelectedTag('All Posts')
    }
  }, [tags, selectedTag])

  const filteredPosts = React.useMemo(() => {
    if (selectedTag === 'All Posts') return posts
    return posts.filter(p => (p.tags || []).includes(selectedTag))
  }, [posts, selectedTag])

  return (
    <>
      {/* Hero Section */}
      <motion.div
        className="relative z-10 pt-32 pb-10 md:pb-12"
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.3 }}
        variants={scrollMotionVariants.staggerContainer}
      >
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={scrollMotionVariants.staggerItem}
          >
            <h1 className="text-section font-heading text-primary mb-6">
              Wellness Blog
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-cecred-chocolate/80 max-w-2xl mx-auto">
              Discover tips, recipes, and insights about essential oils, yoga, and holistic wellness to enhance your natural living journey.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Category Filter Pills */}
      <div className="relative z-10 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
            {tags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                className={`rounded-full h-9 whitespace-nowrap ${selectedTag === tag ? 'bg-emerald-600 text-white' : 'bg-white/70'} `}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <motion.div
        className="relative z-10 pb-20"
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.2 }}
        variants={scrollMotionVariants.staggerContainer}
      >
        <div className="container mx-auto px-6">
          <BlogPageClientSection posts={filteredPosts} />
        </div>
      </motion.div>
    </>
  )
}