import { NextResponse } from 'next/server'

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: 'Hello from test API!' })
}