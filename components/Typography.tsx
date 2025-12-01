import React from 'react'

interface TypographyProps {
  children: React.ReactNode
  variant?: 
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'display-large' | 'display-medium' | 'display-small'
    | 'body-large' | 'body' | 'body-small'
    | 'caption' | 'hero' | 'section'
  className?: string
  as?: React.ElementType
}

const Typography: React.FC<TypographyProps> = ({ 
  children, 
  variant = 'body', 
  className = '',
  as 
}) => {
  // Map variants to appropriate HTML elements and CSS classes
  const variantConfig = {
    'h1': { element: 'h1', className: 'heading-1' },
    'h2': { element: 'h2', className: 'heading-2' },
    'h3': { element: 'h3', className: 'heading-3' },
    'h4': { element: 'h4', className: 'heading-4' },
    'h5': { element: 'h5', className: 'heading-5' },
    'h6': { element: 'h6', className: 'heading-6' },
    'display-large': { element: 'h1', className: 'text-display-large' },
    'display-medium': { element: 'h2', className: 'text-display-medium' },
    'display-small': { element: 'h3', className: 'text-display-small' },
    'body-large': { element: 'p', className: 'text-body-large' },
    'body': { element: 'p', className: 'text-body' },
    'body-small': { element: 'p', className: 'text-body-small' },
    'caption': { element: 'span', className: 'text-caption' },
    'hero': { element: 'h1', className: 'text-hero' },
    'section': { element: 'h2', className: 'text-section' },
  }

  const config = variantConfig[variant]
  const Element = (as || config.element) as React.ElementType
  const combinedClassName = `${config.className} ${className}`.trim()

  return React.createElement(Element, { className: combinedClassName }, children)
}

export default Typography

// Individual typography components for convenience
export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
)

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
)

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
)

export const Heading4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
)

export const Heading5: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h5" {...props} />
)

export const Heading6: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h6" {...props} />
)

export const DisplayLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-large" {...props} />
)

export const DisplayMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-medium" {...props} />
)

export const DisplaySmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-small" {...props} />
)

export const BodyLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-large" {...props} />
)

export const Body: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body" {...props} />
)

export const BodySmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-small" {...props} />
)

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
)

export const Hero: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="hero" {...props} />
)

export const Section: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="section" {...props} />
)