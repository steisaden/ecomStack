import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasAdminUsername: !!process.env.ADMIN_USERNAME,
    hasAdminPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
    hasJwtSecret: !!process.env.JWT_SECRET,
    adminUsername: process.env.ADMIN_USERNAME ? 'SET' : 'NOT SET',
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ? 'SET' : 'NOT SET',
    jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  });
}