import { NextRequest, NextResponse } from 'next/server';

function parseAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_SITE_URL || '';
  return env
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => (v.endsWith('/') ? v.slice(0, -1) : v));
}

export function enforceSameOrigin(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  const allowed = parseAllowedOrigins();

  const candidate = origin || (referer ? new URL(referer).origin : '');

  if (!candidate) {
    return NextResponse.json(
      { error: 'Origin required' },
      { status: 403 }
    );
  }

  if (allowed.length > 0 && !allowed.includes(candidate)) {
    return NextResponse.json(
      { error: 'Invalid origin' },
      { status: 403 }
    );
  }

  return null;
}
