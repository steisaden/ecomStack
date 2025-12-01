// Fusion Design Theme - Glassmorphism + Neumorphism E-commerce System
export const theme = {
  colors: {
    // Primary: Celadon (#74d3ae) - CTA buttons, accents
    celadon: {
      50: '#f0fdf9',
      100: '#ccfbef',
      200: '#99f6e0',
      300: '#5ce8cd',
      400: '#74d3ae', // Primary Celadon
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    // Secondary: Asparagus (#678d58) - text, secondary actions
    asparagus: {
      50: '#f6f8f4',
      100: '#e9f1e4',
      200: '#d3e3ca',
      300: '#b5d1a5',
      400: '#92bb7a',
      500: '#678d58', // Primary Asparagus
      600: '#547247',
      700: '#455a3a',
      800: '#394831',
      900: '#313d2a',
    },
    // Accent: Olivine (#a6c48a) - borders, featured elements
    olivine: {
      50: '#f7f9f4',
      100: '#eef3e7',
      200: '#dce6d0',
      300: '#c4d4b0',
      400: '#a6c48a', // Primary Olivine
      500: '#8fb070',
      600: '#719357',
      700: '#597447',
      800: '#495d3b',
      900: '#3e4f33',
    },
    // Background: Champagne (#f6e7cb) - base background
    champagne: {
      50: '#fefcf8',
      100: '#fdf8ee',
      200: '#f9f0da',
      300: '#f6e7cb', // Primary Champagne
      400: '#f1dab8',
      500: '#eac89a',
      600: '#dfb077',
      700: '#d19954',
      800: '#af7d44',
      900: '#8f653a',
    },
    // Destructive: Coral Pink (#dd9787) - sale tags, alerts
    coral: {
      50: '#fef7f6',
      100: '#feeee9',
      200: '#fcddd7',
      300: '#f9c5b8',
      400: '#f4a691',
      500: '#dd9787', // Primary Coral Pink
      600: '#e36a51',
      700: '#d15542',
      800: '#af4738',
      900: '#914035',
    },
    // Neutral grays for text contrast
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },
  
  typography: {
    fontFamily: {
      heading: ['Inter', 'system-ui', 'sans-serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
  
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
    '6xl': '10rem',
    '7xl': '12rem',
    '8xl': '16rem',
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    '4xl': '2rem',
    full: '9999px',
  },
  
  // Fusion Shadow System - Glassmorphism + Neumorphism
  shadows: {
    // Traditional shadows
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    
    // Neumorphism shadows (dual-tone light/dark)
    neomorphic: {
      sm: '2px 2px 6px rgba(0, 0, 0, 0.1), -2px -2px 6px rgba(255, 255, 255, 0.8)',
      md: '4px 4px 12px rgba(0, 0, 0, 0.15), -4px -4px 12px rgba(255, 255, 255, 0.9)',
      lg: '8px 8px 24px rgba(0, 0, 0, 0.2), -8px -8px 24px rgba(255, 255, 255, 1)',
      inset: 'inset 2px 2px 6px rgba(0, 0, 0, 0.1), inset -2px -2px 6px rgba(255, 255, 255, 0.8)',
    },
    
    // Glassmorphism glows
    glass: {
      subtle: '0 4px 30px rgba(0, 0, 0, 0.1)',
      medium: '0 8px 32px rgba(31, 38, 135, 0.37)',
      strong: '0 12px 40px rgba(31, 38, 135, 0.5)',
    },
  },
  
  // Glass effects configuration
  glass: {
    backdrop: {
      light: 'backdrop-blur(10px)',
      medium: 'backdrop-blur(16px)',
      heavy: 'backdrop-blur(20px)',
    },
    opacity: {
      subtle: 0.1,
      light: 0.2,
      medium: 0.3,
      strong: 0.4,
    },
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

export type Theme = typeof theme

// Fusion Design Utilities
export const fusionUtils = {
  // Create glassmorphism effect
  glass: (opacity: number = 0.3, blur: number = 10) => ({
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  }),
  
  // Create neumorphism effect
  neomorphic: (size: 'sm' | 'md' | 'lg' = 'md') => {
    const shadows = {
      sm: '2px 2px 6px rgba(0, 0, 0, 0.1), -2px -2px 6px rgba(255, 255, 255, 0.8)',
      md: '4px 4px 12px rgba(0, 0, 0, 0.15), -4px -4px 12px rgba(255, 255, 255, 0.9)',
      lg: '8px 8px 24px rgba(0, 0, 0, 0.2), -8px -8px 24px rgba(255, 255, 255, 1)',
    }
    return { boxShadow: shadows[size] }
  },
  
  // Create fusion effect (glass + neomorphic)
  fusion: (glassOpacity: number = 0.3, shadowSize: 'sm' | 'md' | 'lg' = 'md') => ({
    ...fusionUtils.glass(glassOpacity),
    ...fusionUtils.neomorphic(shadowSize),
  }),
}