import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Start with a default response that passes the request through unchanged
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Create a Supabase client that reads from and writes to the request/response cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Read cookies from the INCOMING REQUEST
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Step 1: Update the request cookies (so the rest of this middleware
          // run can see them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Step 2: Rebuild the response with the updated request
          supabaseResponse = NextResponse.next({
            request,
          })
          // Step 3: Write updated cookies to the OUTGOING RESPONSE
          // This is critical — this is how the refreshed token reaches the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add any logic between createServerClient and
  // getUser(). A missing await here causes hard-to-debug auth bugs.

  // getUser() will:
  // 1. Read the access_token from cookies
  // 2. If expired, use the refresh_token to get a new one from Supabase
  // 3. If refresh succeeds, the setAll above writes the new token to cookies
  // 4. Return the user object or null if not authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ROUTE PROTECTION LOGIC
  // If user is NOT logged in AND trying to access /dashboard (or any protected path):
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    // Redirect them to the home page
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Return the response (which may contain refreshed auth cookies)
  return supabaseResponse
}

// Tell Next.js which routes this middleware should run on.
// This matcher runs the middleware on all routes EXCEPT:
// - Next.js internal routes (_next/static, _next/image)
// - favicon.ico
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}