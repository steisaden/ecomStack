import { NextResponse, NextRequest } from 'next/server';
import { AuthenticationService } from './lib/auth';

// Rate limiting storage (in production, use Redis or a database)
const rateLimitStore = new Map<string, { count: number; resetTime: number; blockedUntil?: number }>();

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // Maximum 5 attempts per window
  blockDuration: 30 * 60 * 1000, // Block for 30 minutes after exceeding limit
  progressiveDelay: true, // Enable progressive delays
};

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/admin'];

// Auth routes that need rate limiting
const AUTH_ROUTES = ['/api/auth', '/login'];

/**
 * Rate limiting middleware to prevent brute force attacks
 */
function checkRateLimit(request: NextRequest): { allowed: boolean; response?: NextResponse; headers?: Record<string, string> } {
  const ip = getClientIP(request);
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  
  // Clean up expired entries
  const current = rateLimitStore.get(key);
  if (current && now > current.resetTime && (!current.blockedUntil || now > current.blockedUntil)) {
    rateLimitStore.delete(key);
  }
  
  // Get or create rate limit entry
  const rateLimit = rateLimitStore.get(key) || { 
    count: 0, 
    resetTime: now + RATE_LIMIT_CONFIG.windowMs 
  };
  
  // Check if currently blocked
  if (rateLimit.blockedUntil && now < rateLimit.blockedUntil) {
    const retryAfter = Math.ceil((rateLimit.blockedUntil - now) / 1000);
    const response = NextResponse.json(
      { 
        success: false, 
        message: 'Too many failed attempts. Account temporarily blocked.',
        retryAfter,
        blocked: true
      },
      { status: 429 }
    );
    
    response.headers.set('Retry-After', retryAfter.toString());
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxAttempts.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', rateLimit.blockedUntil.toString());
    
    return { allowed: false, response };
  }
  
  // Check if rate limit exceeded
  if (rateLimit.count >= RATE_LIMIT_CONFIG.maxAttempts) {
    // Block the IP
    rateLimit.blockedUntil = now + RATE_LIMIT_CONFIG.blockDuration;
    rateLimitStore.set(key, rateLimit);
    
    const response = NextResponse.json(
      { 
        success: false, 
        message: 'Rate limit exceeded. Too many attempts.',
        retryAfter: Math.ceil(RATE_LIMIT_CONFIG.blockDuration / 1000),
        blocked: true
      },
      { status: 429 }
    );
    
    response.headers.set('Retry-After', Math.ceil(RATE_LIMIT_CONFIG.blockDuration / 1000).toString());
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxAttempts.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', rateLimit.blockedUntil.toString());
    
    return { allowed: false, response };
  }
  
  // Increment counter for auth attempts (both login and failed attempts)
  if (request.method === 'POST' && (
    request.nextUrl.pathname === '/api/auth' || 
    request.nextUrl.pathname.startsWith('/api/auth/')
  )) {
    rateLimit.count++;
    rateLimitStore.set(key, rateLimit);
  }
  
  // Add rate limit headers to successful responses
  const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - rateLimit.count);
  
  return { 
    allowed: true, 
    headers: {
      'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxAttempts.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.toString()
    }
  };
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to unknown if no IP can be determined
  return 'unknown';
}

/**
 * Simple JWT validation for Edge Runtime
 * This is a simplified version that works in Edge Runtime
 * Full signature verification happens in API routes for security
 */
function validateJWTToken(token: string): any | null {
  try {
    // Split the JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT format: incorrect number of parts');
      return null;
    }

    // Decode the payload (we skip signature verification in middleware for performance)
    // Full verification happens in API routes
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Validate required fields
    if (!payload.userId || !payload.username) {
      console.warn('Invalid JWT payload: missing required fields');
      return null;
    }
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn('JWT token expired');
      return null;
    }
    
    // Check issuer and audience (basic validation)
    if (payload.iss !== 'goddess-admin' || payload.aud !== 'goddess-admin-users') {
      console.warn('Invalid JWT issuer or audience');
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('JWT validation error in middleware:', error);
    return null;
  }
}

/**
 * Validate authentication token from cookies
 */
async function validateAuthToken(request: NextRequest): Promise<{ valid: boolean; user?: any }> {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return { valid: false };
    }
    
    // Simple validation for middleware (full validation happens in API routes)
    const user = validateJWTToken(token);
    
    if (!user) {
      return { valid: false };
    }
    
    return { valid: true, user };
  } catch (error) {
    console.error('Token validation error in middleware:', error);
    return { valid: false };
  }
}

/**
 * Check if the current route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if the current route needs rate limiting
 */
function needsRateLimit(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply rate limiting to auth routes
  if (needsRateLimit(pathname)) {
    const rateLimitResult = checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }
    
    // Add rate limit headers to successful responses
    if (rateLimitResult.headers) {
      const response = NextResponse.next();
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      // For non-protected auth routes, return with rate limit headers
      if (!isProtectedRoute(pathname)) {
        return response;
      }
    }
  }
  
  // Skip authentication for non-protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Validate authentication token
  const authResult = await validateAuthToken(request);
  
  if (authResult.valid) {
    // User is authenticated, allow access
    const response = NextResponse.next();
    
    // Add user info to headers for use in API routes
    if (authResult.user) {
      response.headers.set('x-user-id', authResult.user.userId || '');
      response.headers.set('x-user-role', authResult.user.role || 'admin');
      response.headers.set('x-user-username', authResult.user.username || '');
    }
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }
  
  // Authentication failed, redirect to login
  const loginUrl = new URL('/login', request.url);
  
  // Add redirect parameter to return to original page after login
  loginUrl.searchParams.set('redirect', pathname);
  
  // Log security event
  console.warn(`Unauthorized access attempt to ${pathname} from IP: ${getClientIP(request)}`);
  
  const response = NextResponse.redirect(loginUrl);
  
  // Clear invalid cookies
  response.cookies.delete('auth-token');
  response.cookies.delete('refresh-token');
  
  return response;
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (handled separately with rate limiting)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - @vite/* (vite dev client from IDE/webview)
     * - favicon.ico (favicon file)
     * - public folder files and common assets
     */
    '/((?!api/auth|_next/static|_next/image|@vite/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|map)$).*)',
  ],
};
