// Enhanced theme for modern bento layout with glassmorphism and brand gradient background (no paper/shaders)
export const modernBentoTheme = {
  // Glassmorphism effects
  glass: {
    subtle: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)'
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 12px 40px rgba(31, 38, 135, 0.5)'
    },
    strong: {
      background: 'rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 16px 48px rgba(31, 38, 135, 0.6)'
    }
  },
  
  // Brand gradient background (replaces former paper textures/shaders)
  background: {
    base: {
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 45%, rgba(170, 197, 166, 0.25) 100%)',
    },
    subtle: {
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 45%, rgba(170, 197, 166, 0.25) 100%)',
    }
  },
  
  // Enhanced color palette for bento cards
  cardColors: {
    primary: {
      background: 'linear-gradient(135deg, rgba(116, 211, 174, 0.1) 0%, rgba(116, 211, 174, 0.05) 100%)',
      border: 'rgba(116, 211, 174, 0.3)',
      text: '#047857'
    },
    secondary: {
      background: 'linear-gradient(135deg, rgba(103, 141, 88, 0.1) 0%, rgba(103, 141, 88, 0.05) 100%)',
      border: 'rgba(103, 141, 88, 0.3)',
      text: '#365314'
    },
    accent: {
      background: 'linear-gradient(135deg, rgba(166, 196, 138, 0.1) 0%, rgba(166, 196, 138, 0.05) 100%)',
      border: 'rgba(166, 196, 138, 0.3)',
      text: '#3f6212'
    },
    featured: {
      background: 'linear-gradient(135deg, rgba(221, 151, 135, 0.15) 0%, rgba(221, 151, 135, 0.08) 100%)',
      border: 'rgba(221, 151, 135, 0.4)',
      text: '#7c2d12'
    }
  },
  
  // Animation configurations
  animations: {
    hover: {
      scale: 1.02,
      translateY: -4,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    glass: {
      backdropFilter: 'blur(20px)',
      transition: 'backdrop-filter 0.3s ease'
    },
    stagger: {
      delay: 0.1,
      duration: 0.6
    }
  },
  
  // Typography enhancements for glass backgrounds
  typography: {
    onGlass: {
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      color: 'rgba(0, 0, 0, 0.8)'
    },
    onBackground: {
      textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
      color: 'rgba(0, 0, 0, 0.9)'
    }
  }
};