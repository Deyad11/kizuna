import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/onboarding'

  console.log("CALLBACK HIT, code:", code ? "EXISTS" : "MISSING")
  console.log("ALL PARAMS:", requestUrl.searchParams.toString())

  if (code) {
    const cookieStore = await cookies()
    
    // Log all cookies present at callback time
    console.log("COOKIES AT CALLBACK:", cookieStore.getAll().map(c => c.name))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log("EXCHANGE ERROR:", JSON.stringify(error))
    console.log("EXCHANGE USER:", data?.user?.email)

    if (!error && data.user) {
      // Check if onboarding is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', data.user.id)
        .single()

      console.log("PROFILE:", profile)

const redirectTo = profile?.onboarding_complete ? '/' : '/onboarding'
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
    }

    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error?.message ?? 'exchange_failed')}`, requestUrl.origin)
    )
  }

  return NextResponse.redirect(new URL('/?error=no_code', requestUrl.origin))
}