import { createClient } from '../../../../lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth callback handler for email verification
 * This route handles redirects from Supabase auth email verification
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createClient();
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Redirect to the homepage after successful verification
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If no code is present, redirect to the homepage
  return NextResponse.redirect(new URL('/', request.url));
}
