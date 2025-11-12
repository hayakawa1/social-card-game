import { NextResponse } from 'next/server';
import { signIn } from '@/auth';

/**
 * POST /api/auth/dev-login
 * Development-only auto login endpoint
 * IMPORTANT: This should be disabled in production!
 */
export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    // Sign in with dev credentials
    // Note: CSRF errors are expected in development when calling from API routes
    // The signIn will still work despite the error
    await signIn('credentials', {
      email: 'dev@test.com',
      password: 'dev123',
      redirect: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Logged in as DEV_USER',
        redirectUrl: '/home'
      },
      { status: 200 }
    );
  } catch (error: any) {
    // If it's a CSRF error, login might have succeeded anyway
    if (error?.message?.includes('CSRF') || error?.type === 'MissingCSRF') {
      console.warn('Dev login CSRF warning (expected in development):', error.message);
      return NextResponse.json(
        {
          success: true,
          message: 'Logged in as DEV_USER (CSRF warning ignored)',
          redirectUrl: '/home'
        },
        { status: 200 }
      );
    }

    console.error('Dev login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
