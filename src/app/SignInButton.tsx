"use client";
// ^ This line is required. It tells Next.js this file runs in the browser.
// Without it, you cannot use onClick, useState, or any browser APIs.
// The rule: if you need interactivity or browser APIs → "use client"

import { createClient } from "@/lib/supabase/client";

export default function SignInButton() {
  const handleSignIn = async () => {
    // Create the BROWSER client (not the server client)
    const supabase = createClient();

    // signInWithOAuth initiates the OAuth flow.
    // It does NOT return the user — it redirects the browser.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // redirectTo tells Supabase where to send the user after Google auth.
        // This MUST match what you whitelisted in Supabase's URL configuration.
        redirectTo: `${window.location.origin}/auth/callback`,

        // queryParams are sent to Google as part of the OAuth request.
        // access_type: 'offline' → tells Google to include a refresh_token
        //              so users stay logged in long-term
        // prompt: 'consent' → forces the consent screen to show every time.
        //         Remove this in production once you've verified it works.
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Sign in error:", error.message);
      alert("Sign in failed: " + error.message);
    }
    // If no error, the browser will have already been redirected to Google.
    // This function effectively ends here — the redirect takes over.
  };

  return (
    <button
      onClick={handleSignIn}
      style={{
        padding: "12px 24px",
        fontSize: "16px",
        cursor: "pointer",
        backgroundColor: "#4285f4",
        color: "white",
        border: "none",
        borderRadius: "4px",
      }}
    >
      Continue with Google
    </button>
  );
}
