import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Extract the full URL so we can parse query parameters
  const requestUrl = new URL(request.url)

  // Google sends back a 'code' parameter after successful authentication.
  // Example URL: http://localhost:3000/auth/callback?code=4/0AfJohXn...
  const code = requestUrl.searchParams.get('code')

  // 'next' is a custom parameter we can pass when initiating sign-in.
  // It lets us redirect to a specific page after login.
  // Default to '/dashboard' if not specified.
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // This is the critical step. exchangeCodeForSession does:
    // 1. Sends the 'code' to Supabase's servers
    // 2. Supabase sends it to Google to verify it's real
    // 3. Google returns an access_token and id_token to Supabase
    // 4. Supabase creates/finds the user in auth.users
    // 5. Supabase returns its OWN access_token + refresh_token to us
    // 6. These get stored in cookies via the setAll function above
const { data, error } = await supabase.auth.exchangeCodeForSession(code)

console.log("DATA:", data)
console.log("ERROR:", error)

    if (!error) {
      // Auth succeeded. Redirect to the dashboard (or wherever 'next' says).
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    // If there was an error, log it (server-side, not visible to user)
    console.error('Auth exchange error:', error)
  }

  // If we get here, something went wrong (no code, or exchange failed).
  // Redirect to home with an error indicator.
  return NextResponse.redirect(
    new URL('/?error=auth_failed', requestUrl.origin)
  )
}