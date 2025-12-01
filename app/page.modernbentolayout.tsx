'use client'

import { ModernBentoLayout } from "@/components/ModernBentoLayout"
import { mockRootProps } from "@/modernBentoMockData"

export default function ModernBentoLayoutPreview() {
  return (
    <div className="min-h-screen">
      <ModernBentoLayout {...mockRootProps} />
    </div>
  )
}