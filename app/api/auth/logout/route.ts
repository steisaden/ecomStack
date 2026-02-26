import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        // Clear the authentication cookie
        cookieStore.delete('auth-token');

        // Redirect the user back to the login page
        return NextResponse.redirect(new URL('/login', request.url));
    } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, redirect to login for security
        return NextResponse.redirect(new URL('/login', request.url));
    }
}
