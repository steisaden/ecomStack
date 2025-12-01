import * as React from "react"
import { ContentCard, ContentCardProps } from "./ContentCard"

export interface FeatureCardProps extends Omit<ContentCardProps, 'variant'> {
  icon?: React.ReactNode
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, content, ...props }, ref) => {
    const iconDisplay = icon ? (
      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mb-4">
        {React.isValidElement(icon) && React.cloneElement(icon, { 
          className: "w-6 h-6" 
        } as any)}
      </div>
    ) : null
    
    const featureContent = (
      <div>
        {iconDisplay}
        {content}
      </div>
    )
    
    return (
      <ContentCard
        ref={ref}
        variant="minimal"
        title={title}
        content={featureContent}
        {...props}
      />
    )
  }
)

FeatureCard.displayName = "FeatureCard"