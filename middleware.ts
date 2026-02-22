import { NextResponse, NextRequest } from 'next/server';
// Removed import of AuthenticationService to avoid loading fs/bcrypt in Edge Runtime

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowSeconds: 15 * 60, // 15 minutes
  maxAttempts: 5, // Maximum 5 attempts per window
};

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/admin'];

// Auth routes that need rate limiting
const AUTH_ROUTES = [
  '/api/auth',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/admin-users/setup',
  '/login',
];

/**
 * Rate limiting middleware to prevent brute force attacks
 */
async function checkRateLimit(request: NextRequest): Promise<{ allowed: boolean; response?: NextResponse; headers?: Record<string, string> }> {
  const ip = getClientIP(request);
  const scope = request.nextUrl.pathname;

  try {
    const rateLimitUrl = new URL('/api/auth/rate-limit', request.url);
    const rlResponse = await fetch(rateLimitUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ip,
        scope,
        limit: RATE_LIMIT_CONFIG.maxAttempts,
        windowSeconds: RATE_LIMIT_CONFIG.windowSeconds
      })
    });

    const result = await rlResponse.json();

    if (!result.success) {
      const response = NextResponse.json(
        {
          success: false,
          message: 'Too many failed attempts. Account temporarily blocked.',
          retryAfter: result.resetIn,
          blocked: true
        },
        { status: 429 }
      );

      response.headers.set('Retry-After', String(result.resetIn));
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxAttempts.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', String(result.resetIn));

      return { allowed: false, response };
    }

    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxAttempts.toString(),
        'X-RateLimit-Remaining': String(result.remaining ?? 0),
        'X-RateLimit-Reset': String(result.resetIn ?? RATE_LIMIT_CONFIG.windowSeconds)
      }
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return {
      allowed: false,
      response: NextResponse.json(
        { success: false, message: 'Rate limiting unavailable' },
        { status: 503 }
      )
    };
  }
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
 * Validate authentication token from cookies
 */
async function validateAuthToken(request: NextRequest): Promise<{ valid: boolean }> {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return { valid: false };
    }

    // Do not decode or trust JWTs in middleware. Server routes must verify signatures.
    return { valid: true };
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
    const rateLimitResult = await checkRateLimit(request);
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
    // User is authenticated (token presence only); server routes must verify signature.
    const response = NextResponse.next();

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
