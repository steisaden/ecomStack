import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/auth';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }
  
  try {
    const credentials = await request.json();
    
    console.log('🔍 Debug Auth - Environment Variables:');
    console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
    console.log('ADMIN_PASSWORD_HASH:', process.env.ADMIN_PASSWORD_HASH);
    
    console.log('🔍 Debug Auth - Received Credentials:');
    console.log('Username:', credentials.username);
    console.log('Password:', credentials.password);
    
    // Test username comparison
    const usernameMatch = credentials.username === process.env.ADMIN_USERNAME;
    console.log('🔍 Username match:', usernameMatch);
    
    // Test password verification directly
    const bcrypt = require('bcryptjs');
    const passwordValid = await bcrypt.compare(credentials.password, process.env.ADMIN_PASSWORD_HASH);
    console.log('🔍 Direct bcrypt verification:', passwordValid);
    
    // Test the authentication service directly
    const authResult = await AuthenticationService.login(credentials);
    
    console.log('🔍 Debug Auth - Auth Result:');
    console.log('Success:', authResult.success);
    console.log('Error:', authResult.error);
    
    return NextResponse.json({
      environment: {
        ADMIN_USERNAME: process.env.ADMIN_USERNAME,
        ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH ? 
          `${process.env.ADMIN_PASSWORD_HASH.substring(0, 15)}...` : 'NOT SET',
      },
      credentials: {
        username: credentials.username,
        password: credentials.password ? `${credentials.password.substring(0, 3)}...` : 'NOT SET'
      },
      debug: {
        usernameMatch: usernameMatch,
        directBcryptVerification: passwordValid
      },
      authResult: {
        success: authResult.success,
        error: authResult.error
      }
    });
    
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}