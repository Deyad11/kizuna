import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // cookies() is a Next.js function that reads the HTTP request cookies
  // We must await it in Next.js 15+
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // getAll: Called by Supabase to read all auth cookies from the request
        getAll() {
          return cookieStore.getAll()
        },
        // setAll: Called by Supabase to write updated auth cookies to the response
        // This is how token refresh works on the server — Supabase reads the old
        // token, generates a new one, and writes it back via setAll
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll can throw in Server Components (which are read-only).
            // This is fine — the middleware will handle the refresh instead.
            // We catch silently here to avoid crashing Server Components.
          }
        },
      },
    }
  )
}