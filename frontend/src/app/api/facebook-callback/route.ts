import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL parameters
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    // If there's an error parameter, handle it
    if (error) {
      console.error('Facebook auth error:', error);
      return NextResponse.redirect(new URL('/login?error=facebook_auth_failed', request.url));
    }

    // If no code is provided, redirect to login
    if (!code) {
      console.error('No code provided in Facebook callback');
      return NextResponse.redirect(new URL('/login?error=no_auth_code', request.url));
    }

    // Forward the code to your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/facebook/callback?code=${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If the backend returns a redirect, follow it
    if (response.redirected) {
      return NextResponse.redirect(response.url);
    }

    // If the backend returns a successful response with JSON
    if (response.ok) {
      const data = await response.json();
      
      // If token is included in the response, redirect to success page
      if (data.token) {
        return NextResponse.redirect(new URL(`/auth/facebook-success?token=${data.token}`, request.url));
      }
    }

    // Handle errors
    console.error('Backend processing failed for Facebook callback');
    return NextResponse.redirect(new URL('/login?error=backend_processing_failed', request.url));
  } catch (error) {
    console.error('Error processing Facebook callback:', error);
    return NextResponse.redirect(new URL('/login?error=internal_server_error', request.url));
  }
} 