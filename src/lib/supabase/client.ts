import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // createBrowserClient reads/writes cookies in the browser
  // It uses the NEXT_PUBLIC_ variables (safe to be in browser code)
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}