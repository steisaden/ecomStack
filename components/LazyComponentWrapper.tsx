'use client';

import React, { Suspense, lazy } from 'react';

interface LazyComponentWrapperProps {
  componentPath: string;
  componentName: string;
  fallback?: React.ReactNode;
  [key: string]: any;
}

/**
 * Lazy Component Wrapper for dynamic imports and lazy loading
 * This component helps with code splitting and lazy loading
 */
export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({ 
  componentPath, 
  componentName, 
  fallback = null, 
  ...props 
}) => {
  const LazyComponent = lazy(() => import(`${componentPath}`).then(module => ({ default: module[componentName] })));
  
  return (
    <Suspense fallback={fallback || <div className="p-4">Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default LazyComponentWrapper;