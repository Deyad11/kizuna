// No "use client" here — this is a SERVER component by default in App Router
// Server components run on the server, can read cookies, but can't use
// browser events like onClick

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignInButton from "./SignInButton";

export default async function Home() {
  // Create the server-side Supabase client
  const supabase = await createClient();

  // getUser() checks the auth cookies and returns the current user.
  // If no valid session exists, user will be null.
  // Always use getUser() instead of getSession() for security —
  // getUser() validates the token with Supabase's server, while
  // getSession() only reads local cookies without server validation.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already logged in, send them straight to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // User is not logged in — show the sign in page
  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>絆 Kizuna</h1>
      <p>
        A real-time shared reaction platform for anime, manga, and webtoon
        communities.
      </p>
      <p style={{ color: "#666", marginBottom: "32px" }}>
        Sign in to find someone who just finished the same chapter as you.
      </p>

      {/* SignInButton must be a client component because it handles click events */}
      <SignInButton />
    </main>
  );
}
