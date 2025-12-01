import Typography, {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  DisplayLarge,
  DisplayMedium,
  DisplaySmall,
  BodyLarge,
  Body,
  BodySmall,
  Caption,
  Hero,
  Section
} from '../../components/Typography'
import { createMetadataGenerator } from '@/lib/seo'

export const generateMetadata = createMetadataGenerator({
  url: '/typography-test',
});

export default function TypographyTestPage() {
  return (
    <div className="container py-16 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <Hero>Typography Design System</Hero>
        <BodyLarge className="max-w-2xl mx-auto">
          A comprehensive typography system built with responsive scaling, 
          accessibility in mind, and consistent visual hierarchy.
        </BodyLarge>
      </section>

      {/* Display Text Styles */}
      <section className="space-y-8">
        <Section>Display Text Styles</Section>
        <div className="space-y-6">
          <div>
            <Caption>Display Large</Caption>
            <DisplayLarge>The quick brown fox</DisplayLarge>
          </div>
          <div>
            <Caption>Display Medium</Caption>
            <DisplayMedium>The quick brown fox</DisplayMedium>
          </div>
          <div>
            <Caption>Display Small</Caption>
            <DisplaySmall>The quick brown fox</DisplaySmall>
          </div>
        </div>
      </section>

      {/* Heading Hierarchy */}
      <section className="space-y-8">
        <Section>Heading Hierarchy (H1-H6)</Section>
        <div className="space-y-6">
          <div>
            <Caption>Heading 1</Caption>
            <Heading1>The quick brown fox jumps over the lazy dog</Heading1>
          </div>
          <div>
            <Caption>Heading 2</Caption>
            <Heading2>The quick brown fox jumps over the lazy dog</Heading2>
          </div>
          <div>
            <Caption>Heading 3</Caption>
            <Heading3>The quick brown fox jumps over the lazy dog</Heading3>
          </div>
          <div>
            <Caption>Heading 4</Caption>
            <Heading4>The quick brown fox jumps over the lazy dog</Heading4>
          </div>
          <div>
            <Caption>Heading 5</Caption>
            <Heading5>The quick brown fox jumps over the lazy dog</Heading5>
          </div>
          <div>
            <Caption>Heading 6</Caption>
            <Heading6>The quick brown fox jumps over the lazy dog</Heading6>
          </div>
        </div>
      </section>

      {/* Body Text Variants */}
      <section className="space-y-8">
        <Section>Body Text Variants</Section>
        <div className="space-y-6">
          <div>
            <Caption>Body Large</Caption>
            <BodyLarge>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </BodyLarge>
          </div>
          <div>
            <Caption>Body (Default)</Caption>
            <Body>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Body>
          </div>
          <div>
            <Caption>Body Small</Caption>
            <BodySmall>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </BodySmall>
          </div>
        </div>
      </section>

      {/* Color Variants */}
      <section className="space-y-8">
        <Section>Color Variants</Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Caption>Primary Color</Caption>
            <Heading3 className="text-primary">Primary Text Color</Heading3>
            <Body className="text-primary">Body text in primary color</Body>
          </div>
          <div>
            <Caption>Accent Color</Caption>
            <Heading3 className="text-accent">Accent Text Color</Heading3>
            <Body className="text-accent">Body text in accent color</Body>
          </div>
          <div>
            <Caption>Muted Color</Caption>
            <Heading3 className="text-muted">Muted Text Color</Heading3>
            <Body className="text-muted">Body text in muted color</Body>
          </div>
          <div>
            <Caption>Secondary Color</Caption>
            <Heading3 className="text-secondary">Secondary Text Color</Heading3>
            <Body className="text-secondary">Body text in secondary color</Body>
          </div>
        </div>
      </section>

      {/* Responsive Behavior */}
      <section className="space-y-8">
        <Section>Responsive Behavior</Section>
        <div className="space-y-6">
          <Body>
            The typography system automatically scales based on screen size. 
            Resize your browser window to see the responsive behavior in action.
          </Body>
          <div className="bg-light-gray p-6 rounded-lg">
            <Heading1 className="mb-4">This heading scales responsively</Heading1>
            <Body>
              On mobile devices, headings are smaller for better readability. 
              On larger screens, they scale up to create more visual impact.
            </Body>
          </div>
        </div>
      </section>

      {/* Typography in Context */}
      <section className="space-y-8">
        <Section>Typography in Context</Section>
        <article className="max-w-3xl space-y-6">
          <Heading2>The Art of Natural Beauty</Heading2>
          <BodyLarge>
            Discover the transformative power of handcrafted oils and natural beauty essentials 
            that nourish your skin from within.
          </BodyLarge>
          <Body>
            Our carefully curated collection of premium oils is designed to enhance your natural 
            radiance while providing deep nourishment and hydration. Each product is crafted with 
            love and attention to detail, ensuring the highest quality for your beauty routine.
          </Body>
          <Heading3>Key Benefits</Heading3>
          <ul className="space-y-2">
            <li><Body as="span">• Deep hydration and nourishment</Body></li>
            <li><Body as="span">• Natural ingredients sourced ethically</Body></li>
            <li><Body as="span">• Suitable for all skin types</Body></li>
            <li><Body as="span">• Handcrafted with care and precision</Body></li>
          </ul>
          <Caption>Last updated: December 2024</Caption>
        </article>
      </section>

      {/* Accessibility Features */}
      <section className="space-y-8">
        <Section>Accessibility Features</Section>
        <div className="bg-blue-50 p-6 rounded-lg space-y-4">
          <Heading4>Built for Everyone</Heading4>
          <Body>
            Our typography system includes several accessibility features:
          </Body>
          <ul className="space-y-2">
            <li><BodySmall as="span">• Proper semantic HTML structure</BodySmall></li>
            <li><BodySmall as="span">• Sufficient color contrast ratios</BodySmall></li>
            <li><BodySmall as="span">• Scalable text that respects user preferences</BodySmall></li>
            <li><BodySmall as="span">• Clear visual hierarchy</BodySmall></li>
            <li><BodySmall as="span">• Readable line heights and spacing</BodySmall></li>
          </ul>
        </div>
      </section>
    </div>
  )
}