import { getAboutContent } from '../../lib/contentful'
import { createMetadataGenerator } from '@/lib/seo'
import ResponsiveContainer from '@/components/ResponsiveContainer'
import AboutPageClient from '@/components/AboutPageClient'

export const generateMetadata = createMetadataGenerator({
  url: '/about'
});

export default async function AboutPage() {
  const aboutContent = await getAboutContent()
  
  return (
    <div className="relative min-h-screen">
      {/* Background intentionally left plain (no paper shader) */}
      
      <div className="relative z-10">
        <ResponsiveContainer>
          <div className="py-16 md:py-24">
            <AboutPageClient aboutContent={aboutContent} />
          </div>
        </ResponsiveContainer>
      </div>
    </div>
  )
}